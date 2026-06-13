<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["animal_id"])) {
        echo json_encode(["status" => "error", "message" => "Keine Tier-ID erhalten"]);
        exit;
    }

    $animal_id = (int) $data["animal_id"];
    $family_id = (int) $_SESSION["family_id"];

    $stmt = $pdo->prepare("
        DELETE FROM petbowls
        WHERE id = :animal_id AND family_id = :family_id
    ");
    $stmt->execute([":animal_id" => $animal_id, ":family_id" => $family_id]);

    echo json_encode(["status" => "success"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>