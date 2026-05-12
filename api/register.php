<?php
// register.php
session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $email          = trim($data['email'] ?? '');
    $password       = trim($data['password'] ?? '');
    $familienname   = trim($data['familienname'] ?? '');

    if (!$email || !$password || !$familienname) {
        echo json_encode([
            "status" => "error",
            "message" => "Email, Passwort und Familienname sind erforderlich"
        ]);
        exit;
    }

    // Prüfen ob Email bereits existiert
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);

    if ($stmt->fetch()) {
        echo json_encode([
            "status" => "error",
            "message" => "Email wird bereits verwendet"
        ]);
        exit;
    }

    // Passwort hashen
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Benutzer speichern
    $insert = $pdo->prepare("
        INSERT INTO users (email, password, familienname)
        VALUES (:email, :pass, :familienname)
    ");

    $insert->execute([
        ':email'          => $email,
        ':pass'           => $hashedPassword,
        ':familienname'   => $familienname
    ]);

    echo json_encode(["status" => "success"]);

} else {

    echo json_encode([
        "status" => "error",
        "message" => "Ungültige Anfrage"
    ]);
}