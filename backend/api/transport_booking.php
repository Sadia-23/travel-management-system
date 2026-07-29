<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "You must be logged in to book."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$transport_id = isset($data['transport_id']) ? (int)$data['transport_id'] : 0;
$travel_date  = $data['travel_date'] ?? null;
$seats        = isset($data['seats']) ? (int)$data['seats'] : 1;

if (!$transport_id || !$travel_date || $seats < 1) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing or invalid booking details."]);
    exit;
}

try {
    $conn->beginTransaction();

    $stmt = $conn->prepare(
        "SELECT transport_id, price, available_seats, status
         FROM transport
         WHERE transport_id = :id
         FOR UPDATE"
    );
    $stmt->execute(['id' => $transport_id]);
    $transport = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$transport) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Transport not found."]);
        exit;
    }

    if ($transport['status'] !== 'Available' || (int)$transport['available_seats'] < $seats) {
        $conn->rollBack();
        http_response_code(409);
        echo json_encode(["success" => false, "error" => "Not enough seats available."]);
        exit;
    }

    $total_price = $transport['price'] * $seats;

    $stmt = $conn->prepare(
        "INSERT INTO bookings (user_id, booking_type, transport_id, travel_date, seats, total_price, status)
         VALUES (:user_id, 'Transport', :transport_id, :travel_date, :seats, :total_price, 'Upcoming')"
    );
    $stmt->execute([
        'user_id'      => $_SESSION['user_id'],
        'transport_id' => $transport_id,
        'travel_date'  => $travel_date,
        'seats'        => $seats,
        'total_price'  => $total_price,
    ]);

    $booking_id = $conn->lastInsertId();

    $stmt = $conn->prepare(
        "UPDATE transport SET available_seats = available_seats - :seats WHERE transport_id = :id"
    );
    $stmt->execute(['seats' => $seats, 'id' => $transport_id]);

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