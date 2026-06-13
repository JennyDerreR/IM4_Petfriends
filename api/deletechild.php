<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["kid_id"])) {
        echo json_encode(["status" => "error", "message" => "Keine Kind-ID erhalten"]);
        exit;
    }

    $kid_id    = (int) $data["kid_id"];
    $family_id = (int) $_SESSION["family_id"];

    // Prüfen ob Kind noch Tiere hat
    $checkAnimals = $pdo->prepare("
        SELECT id, animal_name FROM petbowls
        WHERE child_id = :kid_id
    ");
    $checkAnimals->execute([":kid_id" => $kid_id]);
    $animals = $checkAnimals->fetchAll(PDO::FETCH_ASSOC);

    if (count($animals) > 0) {
        $names = array_map(fn($a) => $a["animal_name"], $animals);
        echo json_encode([
            "status"  => "has_animals",
            "message" => "Dieses Kind hat noch Tiere: " . implode(", ", $names) . ". Bitte zuerst die Tiere einem anderen Kind zuweisen.",
            "animals" => $animals
        ]);
        exit;
    }

    // Kind löschen
    $stmt = $pdo->prepare("
        DELETE FROM kids
        WHERE id = :kid_id AND family_id = :family_id
    ");
    $stmt->execute([":kid_id" => $kid_id, ":family_id" => $family_id]);

    echo json_encode(["status" => "success"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>