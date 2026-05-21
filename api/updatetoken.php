<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode([
            "status" => "error",
            "message" => "Keine Daten empfangen"
        ]);
        exit;
    }

    if (empty($data["kid_id"]) || !isset($data["amount"])) {
        echo json_encode([
            "status" => "error",
            "message" => "Ungültige Daten"
        ]);
        exit;
    }

    if (empty($_SESSION["family_id"])) {
        echo json_encode([
            "status" => "error",
            "message" => "Keine Familie angemeldet"
        ]);
        exit;
    }

    $kid_id = (int) $data["kid_id"];
    $amount = (int) $data["amount"];
    $family_id = (int) $_SESSION["family_id"];

    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
        UPDATE kids
        SET token = GREATEST(token + :amount, 0)
        WHERE id = :kid_id
        AND family_id = :family_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":amount" => $amount,
        ":kid_id" => $kid_id,
        ":family_id" => $family_id
    ]);

    echo json_encode([
        "status" => "success"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}