<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Admins only."]);
    exit;
}

try {
    $stmt = $conn->query(
        "SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.created_at,
                (SELECT COUNT(*) FROM hotels h WHERE h.provider_id = u.user_id) AS hotel_count,
                (SELECT COUNT(*) FROM transport t WHERE t.provider_id = u.user_id) AS transport_count
         FROM users u
         WHERE u.role = 'provider'
         ORDER BY u.user_id DESC"
    );
    echo json_encode(["success" => true, "providers" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not fetch providers."]);
}