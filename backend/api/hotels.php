<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

// GET /hotels.php            -> list hotels (supports search + filters via query params)
// GET /hotels.php?id=5       -> single hotel detail
//
// Kept as ONE file (not a separate hotel.php) on purpose, to avoid the
// hotel.php vs hotels.php naming mismatch from Day 3.

$hotel_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    if ($hotel_id) {
        // ---- Single hotel detail ----
        $stmt = $conn->prepare(
            "SELECT hotel_id, hotel_name, location, price_per_night, rating,
                    available_rooms, image, description, status
             FROM hotels
             WHERE hotel_id = :id"
        );
        $stmt->execute(['id' => $hotel_id]);
        $hotel = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$hotel) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Hotel not found."]);
            exit;
        }

        echo json_encode(["success" => true, "hotel" => $hotel]);
        exit;
    }

    // ---- List, with optional search + filters ----
    $search     = $_GET['search'] ?? null;      // matches hotel_name or location
    $location   = $_GET['location'] ?? null;    // exact match
    $min_price  = $_GET['min_price'] ?? null;
    $max_price  = $_GET['max_price'] ?? null;
    $min_rating = $_GET['min_rating'] ?? null;

    $sql = "SELECT hotel_id, hotel_name, location, price_per_night, rating,
                   available_rooms, image, description
            FROM hotels
            WHERE status = 'Available'";
    $params = [];

    if ($search !== null && $search !== '') {
        $sql .= " AND (hotel_name LIKE :search OR location LIKE :search)";
        $params['search'] = "%$search%";
    }
    if ($location !== null && $location !== '') {
        $sql .= " AND location = :location";
        $params['location'] = $location;
    }
    if ($min_price !== null && $min_price !== '') {
        $sql .= " AND price_per_night >= :min_price";
        $params['min_price'] = $min_price;
    }
    if ($max_price !== null && $max_price !== '') {
        $sql .= " AND price_per_night <= :max_price";
        $params['max_price'] = $max_price;
    }
    if ($min_rating !== null && $min_rating !== '') {
        $sql .= " AND rating >= :min_rating";
        $params['min_rating'] = $min_rating;
    }

    $sql .= " ORDER BY hotel_id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $hotels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "hotels" => $hotels]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not fetch hotels."]);
}
