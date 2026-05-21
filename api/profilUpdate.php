<?php
session_start();
require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data     = json_decode(file_get_contents("php://input"), true);
    $userID   = $_SESSION['user_id'];
    $lastname = trim($data['lastname'] ?? '');

    if (!$lastname) {
        echo json_encode(["status" => "error", "message" => "Nachname fehlt"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE users SET lastname = :lastname WHERE id = :userID");
    $stmt->execute([':lastname' => $lastname, ':userID' => $userID]);

    echo json_encode(["status" => "success"]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

?>