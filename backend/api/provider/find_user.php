<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'provider') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Providers only."]);
    exit;
}

$q = trim($_GET['q'] ?? '');
if (strlen($q) < 2) {
    echo json_encode(["success" => true, "users" => []]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT user_id, full_name, email, phone FROM users
     WHERE role = 'traveler' AND (full_name LIKE :q OR email LIKE :q)
     ORDER BY full_name LIMIT 10"
);
$stmt->execute(['q' => "%$q%"]);
echo json_encode(["success" => true, "users" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);