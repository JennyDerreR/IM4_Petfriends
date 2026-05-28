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
        SELECT id, kidsname, token
        FROM kids
        WHERE family_id = :family_id
        ORDER BY id ASC
    ");

    $stmt->execute([":family_id" => $family_id]);

    $children = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "children" => $children
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>