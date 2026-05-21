<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        !$data ||
        empty($data["animal_name"]) ||
        empty($data["snr"]) ||
        empty($data["neededgramms"]) ||
        empty($data["child_id"])
    ) {
        echo json_encode([
            "status" => "error",
            "message" => "Ungültige Daten"
        ]);
        exit;
    }

    $animal_name = trim($data["animal_name"]);
    $snr = (int) $data["snr"];
    $neededgramms = (int) $data["neededgramms"];
    $child_id = (int) $data["child_id"];

    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
        INSERT INTO petbowls (
            animal_name,
            snr,
            neededgramms,
            child_id
        )
        VALUES (
            :animal_name,
            :snr,
            :neededgramms,
            :child_id
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":animal_name" => $animal_name,
        ":snr" => $snr,
        ":neededgramms" => $neededgramms,
        ":child_id" => $child_id
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
?>