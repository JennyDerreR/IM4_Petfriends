<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(["status" => "error", "message" => "Keine Daten empfangen"]);
        exit;
    }

    if (empty($data["kidsname"])) {
        echo json_encode(["status" => "error", "message" => "Bitte einen Namen eingeben"]);
        exit;
    }

    if (empty($_SESSION["family_id"])) {
        echo json_encode(["status" => "error", "message" => "Keine Familie angemeldet"]);
        exit;
    }

    $kidsname  = trim($data["kidsname"]);
    $family_id = (int) $_SESSION["family_id"];

    $stmt = $pdo->prepare("
        INSERT INTO kids (kidsname, token, family_id)
        VALUES (:kidsname, 0, :family_id)
    ");

    $stmt->execute([
        ":kidsname"  => $kidsname,
        ":family_id" => $family_id
    ]);

    echo json_encode(["status" => "success", "message" => "Kind erfolgreich gespeichert"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>