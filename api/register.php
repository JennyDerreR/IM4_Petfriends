<?php
// register.php
session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $lastname   = trim($data['lastname'] ?? '');
    $firstname         = trim($data['firstname'] ?? '');
    $email          = trim($data['email'] ?? '');
    $password       = trim($data['password'] ?? '');
    

    if (!$lastname || !$firstname || !$email || !$password) {
        echo json_encode([
            "status" => "error",
            "message" => "Nachname, Vorname, Email und Passwort sind erforderlich"
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
        INSERT INTO users (email, password, lastname, firstname)
        VALUES (:email, :pass, :lastname, :firstname)
    ");

    $insert->execute([
        ':email'          => $email,
        ':pass'           => $hashedPassword,
        ':lastname'       => $lastname,
        ':firstname'      => $firstname
    ]);

    echo json_encode(["status" => "success"]);

} else {

    echo json_encode([
        "status" => "error",
        "message" => "Ungültige Anfrage"
    ]);
}