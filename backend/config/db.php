<?php
$host = getenv("DB_HOST") ?: "localhost";
$db_name = getenv("DB_NAME") ?: "tms";
$username = getenv("DB_USER") ?: "root";
$password = getenv("DB_PASS") ?: "";
$port = getenv("DB_PORT") ?: "3306";
$ssl_ca = getenv("DB_SSL_CA") ?: ""; // path to Aiven's ca.pem, leave unset for local/Railway

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db_name";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5, // fail fast instead of hanging indefinitely
    ];

    // Only enable SSL when a CA cert is supplied (i.e. on Aiven).
    if ($ssl_ca !== "" && file_exists($ssl_ca)) {
        $options[PDO::MYSQL_ATTR_SSL_CA] = $ssl_ca;
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
    }

    $conn = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "error" => "Database connection failed",
        "detail" => $e->getMessage(),
    ]);
    exit;
}