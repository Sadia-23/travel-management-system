<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// GET /transport.php              -> list (supports search + filters)
// GET /transport.php?id=5         -> single transport detail

$transport_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    if ($transport_id) {
        $stmt = $conn->prepare(
            "SELECT transport_id, vehicle_type, company_name, source, destination,
                    departure_time, arrival_time, price, available_seats, image, status
             FROM transport
             WHERE transport_id = :id"
        );
        $stmt->execute(['id' => $transport_id]);
        $transport = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$transport) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Transport not found."]);
            exit;
        }

        echo json_encode(["success" => true, "transport" => $transport]);
        exit;
    }

    // ---- List, with optional search + filters ----
    $source       = $_GET['source'] ?? null;
    $destination  = $_GET['destination'] ?? null;
    $vehicle_type = $_GET['vehicle_type'] ?? null;   // Bus/Train/Flight/Car
    $min_price    = $_GET['min_price'] ?? null;
    $max_price    = $_GET['max_price'] ?? null;

    $sql = "SELECT transport_id, vehicle_type, company_name, source, destination,
                   departure_time, arrival_time, price, available_seats, image
            FROM transport
            WHERE status = 'Available'";
    $params = [];

    if ($source !== null && $source !== '') {
        $sql .= " AND source LIKE :source";
        $params['source'] = "%$source%";
    }
    if ($destination !== null && $destination !== '') {
        $sql .= " AND destination LIKE :destination";
        $params['destination'] = "%$destination%";
    }
    if ($vehicle_type !== null && $vehicle_type !== '') {
        $sql .= " AND vehicle_type = :vehicle_type";
        $params['vehicle_type'] = $vehicle_type;
    }
    if ($min_price !== null && $min_price !== '') {
        $sql .= " AND price >= :min_price";
        $params['min_price'] = $min_price;
    }
    if ($max_price !== null && $max_price !== '') {
        $sql .= " AND price <= :max_price";
        $params['max_price'] = $max_price;
    }

    $sql .= " ORDER BY transport_id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $transport = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "transport" => $transport]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not fetch transport options."]);
}