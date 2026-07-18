<?php
require_once '../config/cors.php';
header("Content-Type: application/json");

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => true,
        "user" => [
            "user_id" => $_SESSION['user_id'],
            "full_name" => $_SESSION['full_name'],
            "role" => $_SESSION['role']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Not logged in."]);
}
?>