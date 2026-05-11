<?php

session_start();
require_once '../system/config.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $userID = $_SESSION['user_id'];
    $familienname    = trim($data['familienname'] ?? '');

    if (!$familienname) {
        echo json_encode(["status" => "error", "message" => "Email and password are required"]);
        exit;
    }

    //echo json_encode(["status" => "success", "familienname" => "Familienname updated successfully"]);

     // Check user in DB
    $stmt = $pdo->prepare("UPDATE users SET familienname =:familienname WHERE id = :userID");
    $stmt->execute([':familienname' => $familienname, ':userID' => $userID]);
    $userUpdate = $stmt->fetch();


    echo json_encode(["status" => "success"]);
    
        
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
