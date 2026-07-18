//Provider + travel registration
<?php
require_once '../config/cors.php';
require_once '../config/db.php';
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'traveler';

if (!$full_name || !$email || !$password) {
    echo json_encode(["success" => false, "error" => "All required fields must be filled."]);
    exit();
}

// Admin accounts can never be created through public registration
if (!in_array($role, ['traveler', 'provider'])) {
    $role = 'traveler';
}

try {
    $check = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "Email already registered."]);
        exit();
    }

    $hashed = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$full_name, $email, $phone, $hashed, $role]);

    echo json_encode(["success" => true, "message" => "Registration successful."]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>