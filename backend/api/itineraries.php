<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

header("Content-Type: application/json");

// GET  /itineraries.php           -> list the logged-in user's saved conversations (light — no full messages)
// GET  /itineraries.php?id=5      -> load one full conversation (messages + itinerary), ownership-checked
// POST /itineraries.php           -> save a NEW conversation, or update an existing one (pass itinerary_id to update)
// DELETE /itineraries.php?id=5    -> delete one of the logged-in user's saved conversations
//
// Requires an active session (same pattern as bookings.php / profile.php).

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Not logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        $itinerary_id = isset($data['itinerary_id']) ? (int)$data['itinerary_id'] : null;
        $destination  = trim($data['destination'] ?? '');
        $days         = isset($data['days']) ? (int)$data['days'] : 0;
        $budget       = isset($data['budget']) ? (float)$data['budget'] : 0;
        $style        = trim($data['style'] ?? '');
        $title        = trim($data['title'] ?? '');

        $preferences = $data['preferences'] ?? [];
        if (!is_array($preferences)) {
            $preferences = array_filter(array_map('trim', explode(',', (string)$preferences)));
        }
        $preferencesStr = count($preferences) > 0 ? implode(', ', $preferences) : null;

        // Both stored as JSON strings — the frontend owns their shape.
        $itineraryJson = json_encode($data['itinerary'] ?? null);
        $messagesJson  = json_encode($data['messages'] ?? []);

        if ($destination === '' || $days <= 0 || ($data['itinerary'] ?? null) === null) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "destination, days and itinerary are required."]);
            exit;
        }
        if ($title === '') {
            $title = $destination . ' Trip';
        }

        if ($itinerary_id) {
            // ---- Update an existing conversation (must belong to this user) ----
            $stmt = $conn->prepare(
                "UPDATE itineraries
                 SET title = :title, destination = :destination, travel_days = :days, budget = :budget,
                     travel_style = :style, preferences = :preferences, itinerary = :itinerary, messages = :messages
                 WHERE itinerary_id = :id AND user_id = :user_id"
            );
            $stmt->execute([
                'title' => $title, 'destination' => $destination, 'days' => $days, 'budget' => $budget,
                'style' => $style !== '' ? $style : null, 'preferences' => $preferencesStr,
                'itinerary' => $itineraryJson, 'messages' => $messagesJson,
                'id' => $itinerary_id, 'user_id' => $user_id,
            ]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "Conversation not found."]);
                exit;
            }

            echo json_encode(["success" => true, "itinerary_id" => $itinerary_id]);
            exit;
        }

        // ---- Save as a new conversation ----
        $stmt = $conn->prepare(
            "INSERT INTO itineraries (user_id, title, destination, travel_days, budget, travel_style, preferences, itinerary, messages)
             VALUES (:user_id, :title, :destination, :days, :budget, :style, :preferences, :itinerary, :messages)"
        );
        $stmt->execute([
            'user_id' => $user_id, 'title' => $title, 'destination' => $destination, 'days' => $days,
            'budget' => $budget, 'style' => $style !== '' ? $style : null, 'preferences' => $preferencesStr,
            'itinerary' => $itineraryJson, 'messages' => $messagesJson,
        ]);

        echo json_encode(["success" => true, "itinerary_id" => $conn->lastInsertId()]);
        exit;
    }

    if ($method === 'DELETE') {
        $itinerary_id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if (!$itinerary_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Itinerary id is required."]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM itineraries WHERE itinerary_id = :id AND user_id = :user_id");
        $stmt->execute(['id' => $itinerary_id, 'user_id' => $user_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Conversation not found."]);
            exit;
        }

        echo json_encode(["success" => true]);
        exit;
    }

    // ---- GET one full conversation ----
    if (isset($_GET['id'])) {
        $itinerary_id = (int)$_GET['id'];
        $stmt = $conn->prepare(
            "SELECT itinerary_id, title, destination, travel_days, budget, travel_style, preferences,
                    itinerary, messages, created_at, updated_at
             FROM itineraries
             WHERE itinerary_id = :id AND user_id = :user_id"
        );
        $stmt->execute(['id' => $itinerary_id, 'user_id' => $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Conversation not found."]);
            exit;
        }

        $row['itinerary'] = $row['itinerary'] ? json_decode($row['itinerary'], true) : null;
        $row['messages']  = $row['messages'] ? json_decode($row['messages'], true) : [];

        echo json_encode(["success" => true, "conversation" => $row]);
        exit;
    }

    // ---- GET: list this user's saved conversations (light payload) ----
    $stmt = $conn->prepare(
        "SELECT itinerary_id, title, destination, travel_days, budget, travel_style, preferences, updated_at, created_at
         FROM itineraries
         WHERE user_id = :user_id
         ORDER BY updated_at DESC"
    );
    $stmt->execute(['user_id' => $user_id]);

    echo json_encode(["success" => true, "itineraries" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error."]);
}
