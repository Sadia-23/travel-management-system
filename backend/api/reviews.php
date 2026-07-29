<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
header("Content-Type: application/json");

// GET  /reviews.php?hotel_id=5              -> public: approved reviews + avg rating for a hotel
// GET  /reviews.php?transport_id=3          -> public: approved reviews + avg rating for a transport option
// GET  /reviews.php?mine=1                  -> auth (traveler): all of MY reviews, any status
// GET  /reviews.php?reviewable=1            -> auth (traveler): my Completed bookings that don't have a review yet
// POST /reviews.php                         -> auth (traveler): submit a new review for one of my completed bookings
// DELETE /reviews.php?id=5                  -> auth (traveler): withdraw my own review, only while still Pending

$method = $_SERVER['REQUEST_METHOD'];

try {
    // ---------------------------------------------------------------
    // Public: approved reviews for a specific hotel or transport option
    // ---------------------------------------------------------------
    if ($method === 'GET' && (isset($_GET['hotel_id']) || isset($_GET['transport_id']))) {
        $hotel_id = isset($_GET['hotel_id']) ? (int)$_GET['hotel_id'] : null;
        $transport_id = isset($_GET['transport_id']) ? (int)$_GET['transport_id'] : null;

        $where = $hotel_id ? "r.hotel_id = :ref_id" : "r.transport_id = :ref_id";
        $ref_id = $hotel_id ?: $transport_id;

        $stmt = $conn->prepare(
            "SELECT r.review_id, r.rating, r.review, r.provider_response, r.created_at,
                    u.full_name AS traveler_name
             FROM reviews r
             JOIN users u ON u.user_id = r.user_id
             WHERE {$where} AND r.status = 'Approved'
             ORDER BY r.created_at DESC"
        );
        $stmt->execute(['ref_id' => $ref_id]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $count = count($reviews);
        $avg = $count > 0 ? round(array_sum(array_column($reviews, 'rating')) / $count, 1) : null;

        echo json_encode([
            "success" => true,
            "reviews" => $reviews,
            "average_rating" => $avg,
            "review_count" => $count,
        ]);
        exit;
    }

    // Everything below requires a logged-in traveler.
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "You must be logged in."]);
        exit;
    }
    if (($_SESSION['role'] ?? '') !== 'traveler') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Only travelers can manage reviews here."]);
        exit;
    }
    $user_id = $_SESSION['user_id'];

    // ---------------------------------------------------------------
    // My own reviews (any status)
    // ---------------------------------------------------------------
    if ($method === 'GET' && isset($_GET['mine'])) {
        $stmt = $conn->prepare(
            "SELECT r.review_id, r.booking_id, r.hotel_id, r.transport_id, r.rating, r.review,
                    r.status, r.provider_response, r.created_at,
                    h.hotel_name, t.company_name, t.vehicle_type, t.source, t.destination
             FROM reviews r
             LEFT JOIN hotels h ON h.hotel_id = r.hotel_id
             LEFT JOIN transport t ON t.transport_id = r.transport_id
             WHERE r.user_id = :user_id
             ORDER BY r.created_at DESC"
        );
        $stmt->execute(['user_id' => $user_id]);
        echo json_encode(["success" => true, "reviews" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ---------------------------------------------------------------
    // Completed bookings that don't have a review yet
    // ---------------------------------------------------------------
    if ($method === 'GET' && isset($_GET['reviewable'])) {
        $stmt = $conn->prepare(
            "SELECT b.booking_id, b.booking_type, b.hotel_id, b.transport_id, b.travel_date,
                    h.hotel_name, h.location AS hotel_location,
                    t.company_name, t.vehicle_type, t.source, t.destination
             FROM bookings b
             LEFT JOIN hotels h ON h.hotel_id = b.hotel_id
             LEFT JOIN transport t ON t.transport_id = b.transport_id
             LEFT JOIN reviews r ON r.booking_id = b.booking_id
             WHERE b.user_id = :user_id
               AND b.status = 'Completed'
               AND r.review_id IS NULL
             ORDER BY b.travel_date DESC"
        );
        $stmt->execute(['user_id' => $user_id]);
        echo json_encode(["success" => true, "bookings" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ---------------------------------------------------------------
    // Submit a new review
    // ---------------------------------------------------------------
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $booking_id = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;
        $rating = isset($data['rating']) ? (int)$data['rating'] : 0;
        $review = trim($data['review'] ?? '');

        if (!$booking_id || $rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "A valid booking and a rating from 1-5 are required."]);
            exit;
        }

        // Look up the booking ourselves — never trust hotel_id/transport_id
        // sent from the client, and make sure this booking really is the
        // traveler's own completed trip.
        $bStmt = $conn->prepare(
            "SELECT booking_id, hotel_id, transport_id, status
             FROM bookings
             WHERE booking_id = :id AND user_id = :user_id"
        );
        $bStmt->execute(['id' => $booking_id, 'user_id' => $user_id]);
        $booking = $bStmt->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Booking not found."]);
            exit;
        }
        if ($booking['status'] !== 'Completed') {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "You can only review completed trips."]);
            exit;
        }

        $dupStmt = $conn->prepare("SELECT review_id FROM reviews WHERE booking_id = :id");
        $dupStmt->execute(['id' => $booking_id]);
        if ($dupStmt->fetch()) {
            http_response_code(409);
            echo json_encode(["success" => false, "error" => "You've already reviewed this booking."]);
            exit;
        }

        $stmt = $conn->prepare(
            "INSERT INTO reviews (booking_id, user_id, hotel_id, transport_id, rating, review, status)
             VALUES (:booking_id, :user_id, :hotel_id, :transport_id, :rating, :review, 'Pending')"
        );
        $stmt->execute([
            'booking_id' => $booking_id,
            'user_id' => $user_id,
            'hotel_id' => $booking['hotel_id'],
            'transport_id' => $booking['transport_id'],
            'rating' => $rating,
            'review' => $review !== '' ? $review : null,
        ]);

        echo json_encode([
            "success" => true,
            "review_id" => $conn->lastInsertId(),
            "message" => "Thanks! Your review has been submitted and is awaiting approval.",
        ]);
        exit;
    }

    // ---------------------------------------------------------------
    // Withdraw my own review, only while still Pending
    // ---------------------------------------------------------------
    if ($method === 'DELETE') {
        $review_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$review_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Review id is required."]);
            exit;
        }

        $stmt = $conn->prepare(
            "DELETE FROM reviews WHERE review_id = :id AND user_id = :user_id AND status = 'Pending'"
        );
        $stmt->execute(['id' => $review_id, 'user_id' => $user_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Review not found, or it has already been reviewed by our team."]);
            exit;
        }

        echo json_encode(["success" => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process review request."]);
}
