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

    if (
        empty($data["animal_name"]) ||
        empty($data["type"]) ||
        empty($data["snr"]) ||
        empty($data["neededgramms"]) ||
        empty($data["child_id"])
    ) {
        echo json_encode([
            "status" => "error",
            "message" => "Bitte alle Felder ausfüllen"
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

    $animal_name = trim($data["animal_name"]);
    $type = trim($data["type"]);
    $snr = trim($data["snr"]);
    $neededgramms = trim($data["neededgramms"]);
    $child_id = (int) $data["child_id"];
    $family_id = (int) $_SESSION["family_id"];

    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $checkChild = $pdo->prepare("
        SELECT id
        FROM kids
        WHERE id = :child_id
        AND family_id = :family_id
    ");

    $checkChild->execute([
        ":child_id" => $child_id,
        ":family_id" => $family_id
    ]);

    if (!$checkChild->fetch()) {
        echo json_encode([
            "status" => "error",
            "message" => "Dieses Kind gehört nicht zu dieser Familie"
        ]);
        exit;
    }

    $sql = "
    INSERT INTO petbowls (
        animal_name,
        type,
        snr,
        neededgramms,
        child_id,
        family_id
    )
    VALUES (
        :animal_name,
        :type,
        :snr,
        :neededgramms,
        :child_id,
        :family_id
    )
";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":animal_name" => $animal_name,
        ":type" => $type,
        ":snr" => $snr,
        ":neededgramms" => $neededgramms,
        ":child_id" => $child_id,
        ":family_id" => $family_id
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Tier erfolgreich gespeichert"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>