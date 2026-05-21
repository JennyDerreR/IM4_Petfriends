<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || empty($data["kidsname"])) {
        echo json_encode([
            "status" => "error",
            "message" => "Kein Name eingegeben"
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

    $kidsname = trim($data["kidsname"]);
    $family_id = (int) $_SESSION["family_id"];

    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
        INSERT INTO kids (
            kidsname,
            family_id
        )
        VALUES (
            :kidsname,
            :family_id
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":kidsname" => $kidsname,
        ":family_id" => $family_id
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Kind erfolgreich gespeichert"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}