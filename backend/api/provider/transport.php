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
$method = $_SERVER['REQUEST_METHOD'];
$transport_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    if ($method === 'GET') {
        if ($transport_id) {
            $stmt = $conn->prepare("SELECT * FROM transport WHERE transport_id = :id AND provider_id = :pid");
            $stmt->execute(['id' => $transport_id, 'pid' => $provider_id]);
            $t = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$t) { http_response_code(404); echo json_encode(["success"=>false,"error"=>"Not found."]); exit; }
            echo json_encode(["success" => true, "transport" => $t]);
            exit;
        }
        $stmt = $conn->prepare("SELECT * FROM transport WHERE provider_id = :pid ORDER BY transport_id DESC");
        $stmt->execute(['pid' => $provider_id]);
        echo json_encode(["success" => true, "transport" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        $vehicle_type = $data['vehicle_type'] ?? '';
        $company_name = trim($data['company_name'] ?? '');
        $source       = trim($data['source'] ?? '');
        $destination  = trim($data['destination'] ?? '');
        $price        = $data['price'] ?? null;
        $seats        = isset($data['available_seats']) ? (int)$data['available_seats'] : 0;
        $image        = trim($data['image'] ?? '') ?: 'https://picsum.photos/seed/transport' . rand(100,999) . '/600/400';

        if (!in_array($vehicle_type, ['Bus','Train','Flight','Car']) || !$source || !$destination || !$price) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Vehicle type, source, destination, and price are required."]);
            exit;
        }

        $stmt = $conn->prepare(
            "INSERT INTO transport (provider_id, vehicle_type, company_name, source, destination, departure_time, arrival_time, price, available_seats, image, status)
             VALUES (:pid, :vtype, :company, :src, :dest, :dep, :arr, :price, :seats, :image, 'Available')"
        );
        $stmt->execute([
            'pid' => $provider_id, 'vtype' => $vehicle_type, 'company' => $company_name,
            'src' => $source, 'dest' => $destination,
            'dep' => $data['departure_time'] ?? null, 'arr' => $data['arrival_time'] ?? null,
            'price' => $price, 'seats' => $seats, 'image' => $image,
        ]);

        echo json_encode(["success" => true, "transport_id" => $conn->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($data['transport_id']) ? (int)$data['transport_id'] : 0;
        if (!$id) { http_response_code(400); echo json_encode(["success"=>false,"error"=>"transport_id is required."]); exit; }

        $stmt = $conn->prepare(
            "UPDATE transport
             SET vehicle_type = :vtype, company_name = :company, source = :src, destination = :dest,
                 departure_time = :dep, arrival_time = :arr, price = :price,
                 available_seats = :seats, image = :image, status = :status
             WHERE transport_id = :id AND provider_id = :pid"
        );
        $stmt->execute([
            'vtype' => $data['vehicle_type'] ?? 'Bus',
            'company' => trim($data['company_name'] ?? ''),
            'src' => trim($data['source'] ?? ''),
            'dest' => trim($data['destination'] ?? ''),
            'dep' => $data['departure_time'] ?? null,
            'arr' => $data['arrival_time'] ?? null,
            'price' => $data['price'] ?? 0,
            'seats' => (int)($data['available_seats'] ?? 0),
            'image' => trim($data['image'] ?? ''),
            'status' => in_array($data['status'] ?? '', ['Available','Unavailable']) ? $data['status'] : 'Available',
            'id' => $id, 'pid' => $provider_id,
        ]);

        if ($stmt->rowCount() === 0) { http_response_code(404); echo json_encode(["success"=>false,"error"=>"Not found or not yours."]); exit; }
        echo json_encode(["success" => true, "message" => "Transport updated."]);
        exit;
    }

    if ($method === 'DELETE') {
        if (!$transport_id) { http_response_code(400); echo json_encode(["success"=>false,"error"=>"id is required."]); exit; }
        if (isset($_GET['hard']) && $_GET['hard'] === '1') {
            $stmt = $conn->prepare("DELETE FROM transport WHERE transport_id = :id AND provider_id = :pid");
        } else {
            $stmt = $conn->prepare("UPDATE transport SET status = 'Unavailable' WHERE transport_id = :id AND provider_id = :pid");
        }
        $stmt->execute(['id' => $transport_id, 'pid' => $provider_id]);
        if ($stmt->rowCount() === 0) { http_response_code(404); echo json_encode(["success"=>false,"error"=>"Not found or not yours."]); exit; }
        echo json_encode(["success" => true, "message" => "Transport removed."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process transport request."]);
}