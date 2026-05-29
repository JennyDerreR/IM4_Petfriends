<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {

    // Prüfen ob Familie existiert
    if (empty($_SESSION["family_id"])) {

        echo json_encode([
            "status" => "error",
            "message" => "Keine Familie angemeldet"
        ]);

        exit;
    }

    // Tier-ID holen
    $animal_id = isset($_GET["id"])
        ? (int) $_GET["id"]
        : 0;

    if (!$animal_id) {

        echo json_encode([
            "status" => "error",
            "message" => "Keine Tier-ID übergeben"
        ]);

        exit;
    }

    $family_id = (int) $_SESSION["family_id"];

    // Datenbankverbindung
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Tierdaten laden
    $stmt = $pdo->prepare("
        SELECT
            id,
            child_id,
            animal_name,
            snr,
            family_id,
            neededgramms,
            type,
            icon
        FROM petbowls
        WHERE id = :id
        AND family_id = :family_id
        LIMIT 1
    ");

    $stmt->execute([
        ":id" => $animal_id,
        ":family_id" => $family_id
    ]);

    $animal = $stmt->fetch(PDO::FETCH_ASSOC);

    // Prüfen ob Tier existiert
    if (!$animal) {

        echo json_encode([
            "status" => "error",
            "message" => "Tier nicht gefunden"
        ]);

        exit;
    }

    // Sensor-Daten laden
    $stmtSensor = $pdo->prepare("
        SELECT
            type,
            filllevel
        FROM data
        WHERE snr = :snr
        AND type IN (
            'Gewichtssensor',
            'Feuchtigkeitssensor'
        )
        ORDER BY timestamp DESC
    ");

    $stmtSensor->execute([
        ":snr" => $animal["snr"]
    ]);

    $sensorRows = $stmtSensor->fetchAll(PDO::FETCH_ASSOC);

    // Standardwerte
    $foodLevel = 0;
    $waterLevel = 0;

    // Neueste Werte holen
    foreach ($sensorRows as $row) {

        // Gewichtssensor = Futter
        if (
            $row["type"] === "Gewichtssensor"
            && $foodLevel === 0
        ) {

            $foodLevel = (int) $row["filllevel"];
        }

        // Feuchtigkeitssensor = Wasser
        if (
            $row["type"] === "Feuchtigkeitssensor"
            && $waterLevel === 0
        ) {

            $waterLevel = (int) $row["filllevel"];
        }
    }

    // JSON zurückgeben
    echo json_encode([

        "status" => "success",

        "animal" => [

            "id" => $animal["id"],

            "child_id" => $animal["child_id"],

            "animal_name" => $animal["animal_name"],

            "type" => $animal["type"],

            "snr" => $animal["snr"],

            "family_id" => $animal["family_id"],

            "neededgramms" => $animal["neededgramms"],

            "food_level" => $foodLevel,

            "water_level" => $waterLevel,
            
            "icon" => $animal["icon"] ?? "dog",
        ]
    ]);

} catch (Exception $e) {

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>