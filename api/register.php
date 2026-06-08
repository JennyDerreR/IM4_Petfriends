<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["lastname"]) || empty($data["firstname"]) || empty($data["email"]) || empty($data["password"])) {
        echo json_encode(["status" => "error", "message" => "Bitte alle Felder ausfüllen"]);
        exit;
    }

    $lastname  = trim($data["lastname"]);
    $firstname = trim($data["firstname"]);
    $email     = trim($data["email"]);
    $password  = password_hash(trim($data["password"]), PASSWORD_DEFAULT);

    // Prüfen ob Email bereits existiert
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $check->execute([":email" => $email]);

    if ($check->fetch()) {
        echo json_encode(["status" => "error", "message" => "Diese E-Mail ist bereits registriert"]);
        exit;
    }

    // User erstellen
    $stmt = $pdo->prepare("
        INSERT INTO users (lastname, firstname, email, password)
        VALUES (:lastname, :firstname, :email, :password)
    ");

    $stmt->execute([
        ":lastname"  => $lastname,
        ":firstname" => $firstname,
        ":email"     => $email,
        ":password"  => $password,
    ]);

    echo json_encode(["status" => "success", "message" => "Registrierung erfolgreich"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>