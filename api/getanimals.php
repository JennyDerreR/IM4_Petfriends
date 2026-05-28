<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    if (empty($_SESSION["family_id"])) {
        echo json_encode([
            "status" => "error",
            "message" => "Keine Familie angemeldet"
        ]);
        exit;
    }

    $family_id = (int) $_SESSION["family_id"];

    $stmt = $pdo->prepare("
        SELECT id, animal_name, type, snr, neededgramms, child_id
        FROM petbowls
        WHERE family_id = :family_id
        ORDER BY id ASC
    ");

    $stmt->execute([":family_id" => $family_id]);

    $animals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "animals" => $animals
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>