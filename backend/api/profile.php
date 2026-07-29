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
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $conn->prepare(
            "SELECT user_id, full_name, email, phone, address, role, profile_image, created_at
             FROM users
             WHERE user_id = :id"
        );
        $stmt->execute(['id' => $user_id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$profile) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Profile not found."]);
            exit;
        }

        echo json_encode(["success" => true, "profile" => $profile]);
        exit;
    }

    if ($method === 'PUT' || $method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        $full_name = trim($data['full_name'] ?? '');
        $phone     = trim($data['phone'] ?? '');
        $address   = trim($data['address'] ?? '');

        // Email, password, and role are intentionally NOT editable here —
        // email is the login identifier (register.php enforces uniqueness),
        // and password changes deserve their own guarded flow, not a plain
        // profile PUT. Keeps this endpoint's blast radius small.
        if (!$full_name) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Full name is required."]);
            exit;
        }

        $stmt = $conn->prepare(
            "UPDATE users SET full_name = :full_name, phone = :phone, address = :address
             WHERE user_id = :id"
        );
        $stmt->execute([
            'full_name' => $full_name,
            'phone'     => $phone,
            'address'   => $address,
            'id'        => $user_id,
        ]);

        // Keep the session's full_name in sync (Navbar reads it via /me.php-cached user)
        $_SESSION['full_name'] = $full_name;

        echo json_encode(["success" => true, "message" => "Profile updated."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process profile request."]);
}