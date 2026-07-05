<?php
header("Content-Type: application/json");
require_once '../config/db.php';

try {
    $stmt = $conn->query("SELECT COUNT(*) as user_count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "user_count" => $result['user_count']]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>