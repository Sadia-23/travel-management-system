<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "You must be logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $conn->prepare(
        "SELECT b.booking_id, b.booking_type, b.travel_date, b.seats, b.nights, b.booking_date,
                b.total_price, b.status,
                h.hotel_name, h.location AS hotel_location, h.image AS hotel_image,
                t.company_name, t.vehicle_type, t.source, t.destination, t.image AS transport_image
         FROM bookings b
         LEFT JOIN hotels h ON b.hotel_id = h.hotel_id
         LEFT JOIN transport t ON b.transport_id = t.transport_id
         WHERE b.user_id = :user_id
         ORDER BY b.booking_date DESC"
    );
    $stmt->execute(['user_id' => $user_id]);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stats = [
        'total_bookings' => count($bookings),
        'upcoming'       => 0,
        'completed'      => 0,
        'cancelled'      => 0,
        'total_spent'    => 0.0,
    ];
    foreach ($bookings as $b) {
        if ($b['status'] === 'Upcoming')  $stats['upcoming']++;
        if ($b['status'] === 'Completed') $stats['completed']++;
        if ($b['status'] === 'Cancelled') $stats['cancelled']++;
        if ($b['status'] !== 'Cancelled') $stats['total_spent'] += (float)$b['total_price'];
    }

    echo json_encode([
        "success"  => true,
        "bookings" => $bookings,
        "stats"    => $stats,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not fetch bookings."]);
}