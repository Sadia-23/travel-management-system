<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/audit.php';
header("Content-Type: application/json");

// GET    /admin/reviews.php               -> every review, with traveler + hotel/transport details
// GET    /admin/reviews.php?status=Pending -> filter by status (Pending / Approved / Rejected)
// PUT    /admin/reviews.php               -> { review_id, status } approve/reject a review
// DELETE /admin/reviews.php?id=5          -> permanently remove a review

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Admins only."]);
    exit;
}

$admin_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Recalculates a hotel's displayed rating from its Approved reviews.
// Transport listings don't currently have a rating column, so this is
// hotel-only, same as the rest of the schema.
function recalc_hotel_rating($conn, $hotel_id)
{
    if (!$hotel_id) return;
    $stmt = $conn->prepare("SELECT AVG(rating) AS avg_rating FROM reviews WHERE hotel_id = :id AND status = 'Approved'");
    $stmt->execute(['id' => $hotel_id]);
    $avg = $stmt->fetchColumn();

    $upd = $conn->prepare("UPDATE hotels SET rating = :rating WHERE hotel_id = :id");
    $upd->execute(['rating' => $avg !== null ? round($avg, 1) : 0.0, 'id' => $hotel_id]);
}

try {
    if ($method === 'GET') {
        $status = $_GET['status'] ?? null;

        $sql = "SELECT r.review_id, r.booking_id, r.hotel_id, r.transport_id, r.rating, r.review,
                       r.status, r.provider_response, r.created_at,
                       u.full_name AS traveler_name, u.email AS traveler_email,
                       h.hotel_name, t.company_name, t.vehicle_type, t.source, t.destination
                FROM reviews r
                JOIN users u ON u.user_id = r.user_id
                LEFT JOIN hotels h ON h.hotel_id = r.hotel_id
                LEFT JOIN transport t ON t.transport_id = r.transport_id";

        $params = [];
        if ($status && in_array($status, ['Pending', 'Approved', 'Rejected'])) {
            $sql .= " WHERE r.status = :status";
            $params['status'] = $status;
        }
        $sql .= " ORDER BY r.created_at DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["success" => true, "reviews" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $review_id = isset($data['review_id']) ? (int)$data['review_id'] : 0;
        $status = $data['status'] ?? '';

        if (!$review_id || !in_array($status, ['Approved', 'Rejected', 'Pending'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Valid review_id and status are required."]);
            exit;
        }

        $old = $conn->prepare("SELECT status, hotel_id FROM reviews WHERE review_id = :id");
        $old->execute(['id' => $review_id]);
        $existing = $old->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Review not found."]);
            exit;
        }

        $stmt = $conn->prepare(
            "UPDATE reviews SET status = :status, reviewed_by = :admin_id, reviewed_at = NOW() WHERE review_id = :id"
        );
        $stmt->execute(['status' => $status, 'admin_id' => $admin_id, 'id' => $review_id]);

        recalc_hotel_rating($conn, $existing['hotel_id']);

        log_admin_action($conn, $admin_id, 'update_review_status', 'review', $review_id, "{$existing['status']} -> {$status}");

        echo json_encode(["success" => true, "message" => "Review status updated."]);
        exit;
    }

    if ($method === 'DELETE') {
        $review_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$review_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "id is required."]);
            exit;
        }

        $old = $conn->prepare("SELECT hotel_id FROM reviews WHERE review_id = :id");
        $old->execute(['id' => $review_id]);
        $existing = $old->fetch(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("DELETE FROM reviews WHERE review_id = :id");
        $stmt->execute(['id' => $review_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Review not found."]);
            exit;
        }

        if ($existing) recalc_hotel_rating($conn, $existing['hotel_id']);

        log_admin_action($conn, $admin_id, 'delete_review', 'review', $review_id);

        echo json_encode(["success" => true, "message" => "Review deleted."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process review request."]);
}
