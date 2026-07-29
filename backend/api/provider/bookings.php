<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'provider') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Providers only."]);
    exit;
}

$provider_id = $_SESSION['user_id'];

try {
    $stmt = $conn->prepare(
        "SELECT b.booking_id, b.booking_type, b.travel_date, b.booking_date,
                b.total_price, b.status, b.seats, b.nights,
                COALESCE(u.full_name, b.guest_name) AS traveler_name,
                COALESCE(u.email, b.guest_email) AS traveler_email,
                b.guest_phone,
                b.booked_by,
                h.hotel_name, h.location AS hotel_location,
                t.company_name, t.vehicle_type, t.source, t.destination
         FROM bookings b
         LEFT JOIN users u ON u.user_id = b.user_id
         LEFT JOIN hotels h ON h.hotel_id = b.hotel_id
         LEFT JOIN transport t ON t.transport_id = b.transport_id
         WHERE h.provider_id = :pid OR t.provider_id = :pid
         ORDER BY b.booking_date DESC"
    );
    $stmt->execute(['pid' => $provider_id]);
    echo json_encode(["success" => true, "bookings" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not fetch bookings."]);
}