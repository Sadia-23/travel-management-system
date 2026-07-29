<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Admins only."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM contact_messages ORDER BY submitted_at DESC");
    echo json_encode(["success" => true, "messages" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

if ($method === 'PUT') { // mark as read
    $data = json_decode(file_get_contents("php://input"), true);
    $conn->prepare("UPDATE contact_messages SET is_read = 1 WHERE message_id = :id")
         ->execute(['id' => (int)($data['message_id'] ?? 0)]);
    echo json_encode(["success" => true]);
    exit;
}

if ($method === 'DELETE') {
    if (!$id) { http_response_code(400); echo json_encode(["success" => false, "error" => "id is required."]); exit; }
    $conn->prepare("DELETE FROM contact_messages WHERE message_id = :id")->execute(['id' => $id]);
    echo json_encode(["success" => true, "message" => "Message deleted."]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed."]);