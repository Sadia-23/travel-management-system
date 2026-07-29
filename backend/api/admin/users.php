<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/audit.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Admins only."]);
    exit;
}

$admin_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$user_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    // ---- GET: list all users (optionally filtered by role), or one user ----
    if ($method === 'GET') {
        $role_filter = $_GET['role'] ?? null;

        if ($user_id) {
            $stmt = $conn->prepare(
                "SELECT user_id, full_name, email, phone, role, address, created_at
                 FROM users WHERE user_id = :id"
            );
            $stmt->execute(['id' => $user_id]);
            $u = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$u) {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "User not found."]);
                exit;
            }
            echo json_encode(["success" => true, "user" => $u]);
            exit;
        }

        if ($role_filter && in_array($role_filter, ['traveler', 'provider', 'admin'])) {
            $stmt = $conn->prepare(
                "SELECT user_id, full_name, email, phone, role, address, created_at
                 FROM users WHERE role = :role ORDER BY user_id DESC"
            );
            $stmt->execute(['role' => $role_filter]);
        } else {
            $stmt = $conn->query(
                "SELECT user_id, full_name, email, phone, role, address, created_at
                 FROM users ORDER BY user_id DESC"
            );
        }
        echo json_encode(["success" => true, "users" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ---- POST: admin creates a new user of any role ----
    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        $full_name = trim($data['full_name'] ?? '');
        $email     = trim($data['email'] ?? '');
        $phone     = trim($data['phone'] ?? '');
        $password  = $data['password'] ?? '';
        $role      = $data['role'] ?? 'traveler';
        $address   = trim($data['address'] ?? '');

        if (!$full_name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Name, email and password are required."]);
            exit;
        }
        if (!in_array($role, ['traveler', 'provider', 'admin'])) $role = 'traveler';

        $check = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["success" => false, "error" => "Email already registered."]);
            exit;
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare(
            "INSERT INTO users (full_name, email, phone, password, role, address)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$full_name, $email, $phone, $hashed, $role, $address]);
        $new_id = $conn->lastInsertId();

        log_admin_action($conn, $admin_id, 'create_user', 'user', $new_id, "role: {$role}");

        echo json_encode(["success" => true, "user_id" => $new_id]);
        exit;
    }

    // ---- PUT: edit a user (name, email, phone, role, address, optional password) ----
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($data['user_id']) ? (int)$data['user_id'] : 0;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "user_id is required."]);
            exit;
        }

        $role = $data['role'] ?? 'traveler';
        if (!in_array($role, ['traveler', 'provider', 'admin'])) $role = 'traveler';

        // Don't let an admin accidentally demote themselves out of the admin role
        if ($id === $admin_id && $role !== 'admin') {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "You cannot change your own role."]);
            exit;
        }

        $fields = "full_name = :name, email = :email, phone = :phone, role = :role, address = :address";
        $params = [
            'name'    => trim($data['full_name'] ?? ''),
            'email'   => trim($data['email'] ?? ''),
            'phone'   => trim($data['phone'] ?? ''),
            'role'    => $role,
            'address' => trim($data['address'] ?? ''),
            'id'      => $id,
        ];

        // Only touch the password column if the admin actually typed a new one
        if (!empty($data['password'])) {
            $fields .= ", password = :password";
            $params['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        $stmt = $conn->prepare("UPDATE users SET $fields WHERE user_id = :id");
        $stmt->execute($params);

        log_admin_action($conn, $admin_id, 'update_user', 'user', $id);

        echo json_encode(["success" => true, "message" => "User updated."]);
        exit;
    }

    // ---- DELETE: hard delete (cascades to their bookings/hotels/transport/reviews) ----
    if ($method === 'DELETE') {
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "id is required."]);
            exit;
        }
        if ($user_id === $admin_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "You cannot delete your own account."]);
            exit;
        }

        $stmt = $conn->prepare("SELECT role FROM users WHERE user_id = :id");
        $stmt->execute(['id' => $user_id]);
        $target = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$target) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "User not found."]);
            exit;
        }

        // Never let the last admin account be deleted, from any client
        if ($target['role'] === 'admin') {
            $count = $conn->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();
            if ((int)$count <= 1) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Cannot delete the last remaining admin."]);
                exit;
            }
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE user_id = :id");
        $stmt->execute(['id' => $user_id]);

        log_admin_action($conn, $admin_id, 'delete_user', 'user', $user_id, "role: {$target['role']}");

        echo json_encode(["success" => true, "message" => "User deleted."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process user request."]);
}