<?php
// cors.php already calls session_set_cookie_params() + session_start()
// with the correct settings — do NOT call session_start() here first.
// (An earlier version of this file did, which caused PHP warnings/notices
// to print before the JSON body and broke the frontend's JSON.parse.)
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "You must be logged in to book."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$hotel_id     = isset($data['hotel_id']) ? (int)$data['hotel_id'] : 0;
$travel_date  = $data['travel_date'] ?? null;
$nights       = isset($data['nights']) ? (int)$data['nights'] : 1;

if (!$hotel_id || !$travel_date || $nights < 1) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing or invalid booking details."]);
    exit;
}

try {
    $conn->beginTransaction();

    // Lock the hotel row so two simultaneous bookings can't both succeed
    // when only one room is left.
    $stmt = $conn->prepare(
        "SELECT hotel_id, price_per_night, available_rooms, status
         FROM hotels
         WHERE hotel_id = :id
         FOR UPDATE"
    );
    $stmt->execute(['id' => $hotel_id]);
    $hotel = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$hotel) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Hotel not found."]);
        exit;
    }

    if ($hotel['status'] !== 'Available' || (int)$hotel['available_rooms'] < 1) {
        $conn->rollBack();
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "This hotel has no rooms available."]);
        exit;
    }

    $total_price = $hotel['price_per_night'] * $nights;

    $stmt = $conn->prepare(
        "INSERT INTO bookings (user_id, booking_type, hotel_id, travel_date, nights, total_price, status)
         VALUES (:user_id, 'Hotel', :hotel_id, :travel_date, :nights, :total_price, 'Upcoming')"
    );
    $stmt->execute([
        'user_id'      => $_SESSION['user_id'],
        'hotel_id'     => $hotel_id,
        'travel_date'  => $travel_date,
        'nights'       => $nights,
        'total_price'  => $total_price,
    ]);

    $booking_id = $conn->lastInsertId();

    $stmt = $conn->prepare(
        "UPDATE hotels SET available_rooms = available_rooms - 1 WHERE hotel_id = :id"
    );
    $stmt->execute(['id' => $hotel_id]);

    $conn->commit();

    echo json_encode([
        "success"     => true,
        "booking_id"  => $booking_id,
        "total_price" => $total_price,
    ]);
} catch (PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process booking."]);
}
