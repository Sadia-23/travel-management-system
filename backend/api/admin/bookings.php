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
$booking_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    // ---- GET: every booking, with traveler + hotel/transport details ----
    if ($method === 'GET') {
        $stmt = $conn->query(
            "SELECT b.booking_id, b.booking_type, b.travel_date, b.seats, b.nights,
                    b.booking_date, b.total_price, b.status,
                    u.user_id AS traveler_id,
                    COALESCE(u.full_name, b.guest_name) AS traveler_name,
                    COALESCE(u.email, b.guest_email) AS traveler_email,
                    b.guest_phone,
                    b.booked_by,
                    h.hotel_name, h.location AS hotel_location,
                    t.company_name, t.vehicle_type, t.source, t.destination
             FROM bookings b
             LEFT JOIN users u ON u.user_id = b.user_id
             LEFT JOIN hotels h ON h.hotel_id = b.hotel_id
             LEFT JOIN transport t ON t.transport_id = b.transport_id
             ORDER BY b.booking_date DESC"
        );
        echo json_encode(["success" => true, "bookings" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // ---- PUT: change a booking's status ----
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = isset($data['booking_id']) ? (int)$data['booking_id'] : 0;
        $status = $data['status'] ?? '';

        if (!$id || !in_array($status, ['Upcoming', 'Completed', 'Cancelled'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Valid booking_id and status are required."]);
            exit;
        }

        // Grab the old status first so the audit log can record the change, not just the result.
        $old = $conn->prepare("SELECT status FROM bookings WHERE booking_id = :id");
        $old->execute(['id' => $id]);
        $old_status = $old->fetchColumn();

        $stmt = $conn->prepare("UPDATE bookings SET status = :status WHERE booking_id = :id");
        $stmt->execute(['status' => $status, 'id' => $id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Booking not found."]);
            exit;
        }

        log_admin_action($conn, $admin_id, 'update_booking_status', 'booking', $id, "{$old_status} -> {$status}");

        echo json_encode(["success" => true, "message" => "Booking status updated."]);
        exit;
    }

    // ---- DELETE: permanently remove a booking record ----
    if ($method === 'DELETE') {
        if (!$booking_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "id is required."]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM bookings WHERE booking_id = :id");
        $stmt->execute(['id' => $booking_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Booking not found."]);
            exit;
        }

        log_admin_action($conn, $admin_id, 'delete_booking', 'booking', $booking_id);

        echo json_encode(["success" => true, "message" => "Booking deleted."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process booking request."]);
}