<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

try {
    $stmt = $conn->prepare(
        "SELECT transport_id, vehicle_type, company_name, source, destination, price, available_seats, image
         FROM transport
         ORDER BY transport_id DESC"
    );
    $stmt->execute();
    $transport = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "transport" => $transport]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not fetch transport options."]);
}