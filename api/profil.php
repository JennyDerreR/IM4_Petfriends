<?php

session_start();

header('Content-Type: application/json');

require_once '../system/config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Nicht eingeloggt"]);
    exit;
}

$userID = $_SESSION['user_id'];

$stmt = $pdo->prepare("SELECT id, email, lastname FROM users WHERE id = :userID");
$stmt->execute([':userID' => $userID]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "status"   => "success",
    "user_id"  => $user['id'],
    "email"    => $user['email'],
    "lastname" => $user['lastname'],
]);
?>