<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $conn->prepare(
        "SELECT hotel_id, hotel_name, location, price_per_night, rating, available_rooms, image, description
         FROM hotels
         ORDER BY hotel_id DESC"
    );
    $stmt->execute();
    $hotels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "hotels" => $hotels]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not fetch hotels."]);
}