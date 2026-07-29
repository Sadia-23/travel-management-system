<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'provider') {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "Providers only."]);
    exit;
}

$provider_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

$booking_type = $data['booking_type'] ?? '';       // 'Hotel' | 'Transport'
$hotel_id     = isset($data['hotel_id']) ? (int)$data['hotel_id'] : null;
$transport_id = isset($data['transport_id']) ? (int)$data['transport_id'] : null;
$travel_date  = $data['travel_date'] ?? null;
$nights       = isset($data['nights']) ? (int)$data['nights'] : null;
$seats        = isset($data['seats']) ? (int)$data['seats'] : null;

$target_user_id = isset($data['user_id']) ? (int)$data['user_id'] : null;
$guest_name  = trim($data['guest_name'] ?? '');
$guest_email = trim($data['guest_email'] ?? '');
$guest_phone = trim($data['guest_phone'] ?? '');

if (!in_array($booking_type, ['Hotel', 'Transport']) || !$travel_date) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing or invalid booking details."]);
    exit;
}
if (!$target_user_id && !$guest_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Select a person or enter guest details."]);
    exit;
}

try {
    $conn->beginTransaction();

    if ($booking_type === 'Hotel') {
        $stmt = $conn->prepare(
            "SELECT hotel_id, price_per_night, available_rooms, status
             FROM hotels WHERE hotel_id = :id AND provider_id = :pid FOR UPDATE"
        );
        $stmt->execute(['id' => $hotel_id, 'pid' => $provider_id]);
        $listing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$listing) {
            $conn->rollBack();
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Hotel not found on your listings."]);
            exit;
        }
        if ($listing['status'] !== 'Available' || (int)$listing['available_rooms'] < 1) {
            $conn->rollBack();
            http_response_code(409);
            echo json_encode(["success" => false, "error" => "This hotel has no rooms available."]);
            exit;
        }

        $nights = max(1, $nights ?: 1);
        $total_price = $listing['price_per_night'] * $nights;

        $stmt = $conn->prepare(
            "INSERT INTO bookings (user_id, guest_name, guest_email, guest_phone, booked_by,
                                    booking_type, hotel_id, travel_date, nights, total_price, status)
             VALUES (:uid, :gname, :gemail, :gphone, :booked_by,
                     'Hotel', :hotel_id, :travel_date, :nights, :total_price, 'Upcoming')"
        );
        $stmt->execute([
            'uid' => $target_user_id, 'gname' => $target_user_id ? null : $guest_name,
            'gemail' => $target_user_id ? null : $guest_email, 'gphone' => $target_user_id ? null : $guest_phone,
            'booked_by' => $provider_id, 'hotel_id' => $hotel_id,
            'travel_date' => $travel_date, 'nights' => $nights, 'total_price' => $total_price,
        ]);
        $conn->prepare("UPDATE hotels SET available_rooms = available_rooms - 1 WHERE hotel_id = :id")
             ->execute(['id' => $hotel_id]);

    } else {
        $stmt = $conn->prepare(
            "SELECT transport_id, price, available_seats, status
             FROM transport WHERE transport_id = :id AND provider_id = :pid FOR UPDATE"
        );
        $stmt->execute(['id' => $transport_id, 'pid' => $provider_id]);
        $listing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$listing) {
            $conn->rollBack();
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Transport not found on your listings."]);
            exit;
        }
        $seats = max(1, $seats ?: 1);
        if ($listing['status'] !== 'Available' || (int)$listing['available_seats'] < $seats) {
            $conn->rollBack();
            http_response_code(409);
            echo json_encode(["success" => false, "error" => "Not enough seats available."]);
            exit;
        }

        $total_price = $listing['price'] * $seats;

        $stmt = $conn->prepare(
            "INSERT INTO bookings (user_id, guest_name, guest_email, guest_phone, booked_by,
                                    booking_type, transport_id, travel_date, seats, total_price, status)
             VALUES (:uid, :gname, :gemail, :gphone, :booked_by,
                     'Transport', :transport_id, :travel_date, :seats, :total_price, 'Upcoming')"
        );
        $stmt->execute([
            'uid' => $target_user_id, 'gname' => $target_user_id ? null : $guest_name,
            'gemail' => $target_user_id ? null : $guest_email, 'gphone' => $target_user_id ? null : $guest_phone,
            'booked_by' => $provider_id, 'transport_id' => $transport_id,
            'travel_date' => $travel_date, 'seats' => $seats, 'total_price' => $total_price,
        ]);
        $conn->prepare("UPDATE transport SET available_seats = available_seats - :s WHERE transport_id = :id")
             ->execute(['s' => $seats, 'id' => $transport_id]);
    }

    $booking_id = $conn->lastInsertId();
    $conn->commit();
    echo json_encode(["success" => true, "booking_id" => $booking_id, "total_price" => $total_price]);
} catch (PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Could not process booking."]);
}