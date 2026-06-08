<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["animal_id"]) || empty($data["new_child_id"])) {
        echo json_encode(["status" => "error", "message" => "Fehlende Parameter"]);
        exit;
    }

    $animal_id    = (int) $data["animal_id"];
    $new_child_id = (int) $data["new_child_id"];
    $family_id    = (int) $_SESSION["family_id"];

    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Prüfen ob neues Kind zur Familie gehört
    $checkChild = $pdo->prepare("SELECT id FROM kids WHERE id = :id AND family_id = :family_id");
    $checkChild->execute([":id" => $new_child_id, ":family_id" => $family_id]);
    if (!$checkChild->fetch()) {
        echo json_encode(["status" => "error", "message" => "Kind gehört nicht zu dieser Familie"]);
        exit;
    }

    // Tier umschreiben
    $stmt = $pdo->prepare("
        UPDATE petbowls SET child_id = :new_child_id
        WHERE id = :animal_id AND family_id = :family_id
    ");
    $stmt->execute([
        ":new_child_id" => $new_child_id,
        ":animal_id"    => $animal_id,
        ":family_id"    => $family_id
    ]);

    echo json_encode(["status" => "success"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>