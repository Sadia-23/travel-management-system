<?php
require_once 'config/db.php';
header("Content-Type: text/plain");

$stmt = $conn->query("SELECT user_id, email, password FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

$fixed = 0;
foreach ($users as $user) {
    // Bcrypt hashes always start with $2y$ — skip if already hashed
    if (str_starts_with($user['password'], '$2y$')) {
        echo "Skipping {$user['email']} — already hashed.\n";
        continue;
    }

    $newHash = password_hash($user['password'], PASSWORD_BCRYPT);
    $update = $conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
    $update->execute([$newHash, $user['user_id']]);

    echo "Fixed {$user['email']} — password is now hashed.\n";
    $fixed++;
}

echo "\nDone. $fixed user(s) updated.\n";
?>