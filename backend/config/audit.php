<?php
// One helper, reused by every admin endpoint that mutates data.
// Call it right after the mutation succeeds — never before, since you only
// want a log row for actions that actually went through.
function log_admin_action($conn, $admin_id, $action, $target_type, $target_id, $details = null) {
    $stmt = $conn->prepare(
        "INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([$admin_id, $action, $target_type, $target_id, $details]);
}