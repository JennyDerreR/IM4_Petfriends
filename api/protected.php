<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

include_once '../system/config.php';

$stmt = $pdo->prepare("SELECT lastname FROM users WHERE id = :id");
$stmt->execute([':id' => $_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "status" => "success",
    "user_id" => $_SESSION['user_id'],
    "familienname" => $user['lastname'] ?? ""
]);