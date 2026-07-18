<?php
require_once '../config/cors.php';
require_once '../config/db.php';
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "error" => "Email and password are required."]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT user_id, full_name, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "error" => "Invalid email or password."]);
        exit();
    }

    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['full_name'] = $user['full_name'];

    echo json_encode([
        "success" => true,
        "user" => [
            "user_id" => $user['user_id'],
            "full_name" => $user['full_name'],
            "email" => $user['email'],
            "role" => $user['role']
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>