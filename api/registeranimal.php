<?php
session_start();

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../db.php";

if (!isset($_SESSION["family_id"])) {
    echo json_encode([
        "status" => "error",
        "message" => "Nicht eingeloggt oder family_id fehlt."
    ]);
    exit;
}

$family_id = (int) $_SESSION["family_id"];


$data = json_decode(file_get_contents("php://input"), true);

$animal_name = trim($data["animal_name"] ?? "");
$snr = trim($data["snr"] ?? "");
$neededgramms = trim($data["neededgramms"] ?? "");
$child_id = trim($data["child_id"] ?? "");

if ($animal_name === "" || $snr === "" || $neededgramms === "" || $child_id === "") {
    echo json_encode([
        "status" => "error",
        "message" => "Bitte alle Felder ausfüllen."
    ]);
    exit;
}

try {
    $checkFamily = $pdo->prepare("
        SELECT id 
        FROM families 
        WHERE id = ?
    ");
    $checkFamily->execute([$family_id]);

    if (!$checkFamily->fetch()) {
        echo json_encode([
            "status" => "error",
            "message" => "Diese Familie existiert nicht."
        ]);
        exit;
    }

    $checkChild = $pdo->prepare("
        SELECT id 
        FROM children 
        WHERE id = ? 
        AND family_id = ?
    ");
    $checkChild->execute([$child_id, $family_id]);

    if (!$checkChild->fetch()) {
        echo json_encode([
            "status" => "error",
            "message" => "Dieses Kind gehört nicht zu dieser Familie."
        ]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO petbowls 
        (animal_name, snr, neededgramms, child_id, family_id)
        VALUES 
        (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $animal_name,
        $snr,
        $neededgramms,
        $child_id,
        $family_id
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Tier erfolgreich gespeichert."
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>