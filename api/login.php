<?php

// login.php
ini_set('session.cookie_httponly', 1);
session_start();

header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data     = json_decode(file_get_contents("php://input"), true);
    $email    = trim($data['email']    ?? '');
    $password = trim($data['password'] ?? '');

    if (!$email || !$password) {
        echo json_encode(["status" => "error", "message" => "E-Mail und Passwort sind erforderlich"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email']   = $email;

        // Vollständige Userdaten laden
        $stmt2 = $pdo->prepare("SELECT id, firstname, lastname, family_id FROM users WHERE id = :id");
        $stmt2->execute([':id' => $user['id']]);
        $userData = $stmt2->fetch(PDO::FETCH_ASSOC);

        // family_id in Session speichern
        $_SESSION['family_id'] = $userData['family_id'];

        echo json_encode([
            "status"    => "success",
            "user_id"   => $userData['id'],
            "firstname" => $userData['firstname'],
            "lastname"  => $userData['lastname'],
            "family_id" => $userData['family_id'],
        ]);

    } else {
        echo json_encode(["status" => "error", "message" => "Ungültige Anmeldedaten"]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Ungültige Anfragemethode"]);
}
?>