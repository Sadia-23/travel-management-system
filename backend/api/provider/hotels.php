<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
header("Content-Type: application/json");

// Every action here is scoped to the logged-in provider's own rows.
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'provider') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Providers only."]);
    exit;
}

$provider_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$hotel_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    // ---- GET: list own hotels, or one hotel detail ----
    if ($method === 'GET') {
        if ($hotel_id) {
            $stmt = $conn->prepare(
                "SELECT * FROM hotels WHERE hotel_id = :id AND provider_id = :pid"
            );
            $stmt->execute(['id' => $hotel_id, 'pid' => $provider_id]);
            $hotel = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$hotel) {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "Hotel not found."]);
                exit;
            }
            echo json_encode(["success" => true, "hotel" => $hotel]);
            exit;
        }

        $stmt = $conn->prepare(
            "SELECT * FROM hotels WHERE provider_id = :pid ORDER BY hotel_id DESC"
        );
        $stmt->execute(['pid' => $provider_id]);
        echo json_encode(["success" => true, "hotels" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ---- POST: create a new hotel listing ----
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        $hotel_name      = trim($data['hotel_name'] ?? '');
        $location        = trim($data['location'] ?? '');
        $price_per_night = $data['price_per_night'] ?? null;
        $available_rooms = isset($data['available_rooms']) ? (int)$data['available_rooms'] : 0;
        $description     = trim($data['description'] ?? '');
        $image           = trim($data['image'] ?? '') ?: 'https://picsum.photos/seed/hotel' . rand(100,999) . '/600/400';

        if (!$hotel_name || !$location || !$price_per_night) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Hotel name, location, and price are required."]);
            exit;
        }

        $stmt = $conn->prepare(
            "INSERT INTO hotels (provider_id, hotel_name, description, location, price_per_night, available_rooms, image, status)
             VALUES (:pid, :name, :desc, :loc, :price, :rooms, :image, 'Available')"
        );
        $stmt->execute([
            'pid'   => $provider_id,
            'name'  => $hotel_name,
            'desc'  => $description,
            'loc'   => $location,
            'price' => $price_per_night,
            'rooms' => $available_rooms,
            'image' => $image,
        ]);

        echo json_encode(["success" => true, "hotel_id" => $conn->lastInsertId()]);
        exit;
    }

    // ---- PUT: update own hotel (ownership enforced in WHERE) ----
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($data['hotel_id']) ? (int)$data['hotel_id'] : 0;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "hotel_id is required."]);
            exit;
        }

        $stmt = $conn->prepare(
            "UPDATE hotels
             SET hotel_name = :name, description = :desc, location = :loc,
                 price_per_night = :price, available_rooms = :rooms,
                 image = :image, status = :status
             WHERE hotel_id = :id AND provider_id = :pid"
        );
        $stmt->execute([
            'name'   => trim($data['hotel_name'] ?? ''),
            'desc'   => trim($data['description'] ?? ''),
            'loc'    => trim($data['location'] ?? ''),
            'price'  => $data['price_per_night'] ?? 0,
            'rooms'  => (int)($data['available_rooms'] ?? 0),
            'image'  => trim($data['image'] ?? ''),
            'status' => in_array($data['status'] ?? '', ['Available','Unavailable']) ? $data['status'] : 'Available',
            'id'     => $id,
            'pid'    => $provider_id,
        ]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Hotel not found or not yours."]);
            exit;
        }

        echo json_encode(["success" => true, "message" => "Hotel updated."]);
        exit;
    }

    // ---- DELETE: deactivate by default; ?hard=1 for a real delete ----
    if ($method === 'DELETE') {
        $id = $hotel_id;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "id is required."]);
            exit;
        }

        if (isset($_GET['hard']) && $_GET['hard'] === '1') {
            $stmt = $conn->prepare("DELETE FROM hotels WHERE hotel_id = :id AND provider_id = :pid");
        } else {
            $stmt = $conn->prepare("UPDATE hotels SET status = 'Unavailable' WHERE hotel_id = :id AND provider_id = :pid");
        }
        $stmt->execute(['id' => $id, 'pid' => $provider_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Hotel not found or not yours."]);
            exit;
        }

        echo json_encode(["success" => true, "message" => "Hotel removed."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process hotel request."]);
}