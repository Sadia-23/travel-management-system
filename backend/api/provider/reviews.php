<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
header("Content-Type: application/json");

// GET /provider/reviews.php                 -> reviews on MY hotels/transport
// GET /provider/reviews.php?status=Pending  -> filter by status
// PUT /provider/reviews.php                 -> { review_id, status, provider_response? }
//     Providers can Approve/Reject reviews on their own listings, and
//     optionally attach a public reply (provider_response).

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'provider') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Providers only."]);
    exit;
}

$provider_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

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
                       u.full_name AS traveler_name,
                       h.hotel_name, t.company_name, t.vehicle_type, t.source, t.destination
                FROM reviews r
                JOIN users u ON u.user_id = r.user_id
                LEFT JOIN hotels h ON h.hotel_id = r.hotel_id
                LEFT JOIN transport t ON t.transport_id = r.transport_id
                WHERE (h.provider_id = :pid OR t.provider_id = :pid)";

        $params = ['pid' => $provider_id];
        if ($status && in_array($status, ['Pending', 'Approved', 'Rejected'])) {
            $sql .= " AND r.status = :status";
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
        $status = $data['status'] ?? null;
        $response = array_key_exists('provider_response', $data) ? trim($data['provider_response']) : null;

        if (!$review_id) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "review_id is required."]);
            exit;
        }
        if ($status !== null && !in_array($status, ['Approved', 'Rejected', 'Pending'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Invalid status."]);
            exit;
        }

        // Ownership check: this review must belong to one of THIS provider's
        // hotels or transport listings.
        $check = $conn->prepare(
            "SELECT r.review_id, r.hotel_id, r.status
             FROM reviews r
             LEFT JOIN hotels h ON h.hotel_id = r.hotel_id
             LEFT JOIN transport t ON t.transport_id = r.transport_id
             WHERE r.review_id = :id AND (h.provider_id = :pid OR t.provider_id = :pid)"
        );
        $check->execute(['id' => $review_id, 'pid' => $provider_id]);
        $existing = $check->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Review not found on your listings."]);
            exit;
        }

        $fields = [];
        $params = ['id' => $review_id];
        if ($status !== null) {
            $fields[] = "status = :status";
            $fields[] = "reviewed_by = :provider_id";
            $fields[] = "reviewed_at = NOW()";
            $params['status'] = $status;
            $params['provider_id'] = $provider_id;
        }
        if ($response !== null) {
            $fields[] = "provider_response = :response";
            $params['response'] = $response !== '' ? $response : null;
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Nothing to update."]);
            exit;
        }

        $sql = "UPDATE reviews SET " . implode(', ', $fields) . " WHERE review_id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        if ($status !== null) {
            recalc_hotel_rating($conn, $existing['hotel_id']);
        }

        echo json_encode(["success" => true, "message" => "Review updated."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process review request."]);
}
