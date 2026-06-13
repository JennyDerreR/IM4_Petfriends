<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {
    if (empty($_SESSION["family_id"])) {
        echo json_encode(["status" => "error", "message" => "Keine Familie angemeldet"]);
        exit;
    }

    $family_id = (int) $_SESSION["family_id"];
    $today     = date("Y-m-d");

    $stmt = $pdo->prepare("
        SELECT id, animal_name, type, snr, neededgramms, child_id, icon
        FROM petbowls
        WHERE family_id = :family_id
        ORDER BY id ASC
    ");
    $stmt->execute([":family_id" => $family_id]);
    $animals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($animals as &$animal) {

        // Aktueller Sensor-Wert
        $sensorStmt = $pdo->prepare("
            SELECT type, filllevel
            FROM data
            WHERE snr = :snr
              AND type IN ('Gewichtssensor', 'Feuchtigkeitssensor')
              AND filllevel >= 0
            ORDER BY timestamp DESC
            LIMIT 20
        ");
        $sensorStmt->execute([":snr" => $animal["snr"]]);
        $rows = $sensorStmt->fetchAll(PDO::FETCH_ASSOC);

        $foodLevel  = 0;
        $waterLevel = 0;

        foreach ($rows as $row) {
            if ($row["type"] === "Gewichtssensor"      && $foodLevel  === 0) $foodLevel  = (int)$row["filllevel"];
            if ($row["type"] === "Feuchtigkeitssensor" && $waterLevel === 0) $waterLevel = (int)$row["filllevel"];
        }

        $animal["food_level"]  = $foodLevel;
        $animal["water_level"] = $waterLevel;

        // Prüfen ob Aufgaben heute schon erledigt
        $foodCheck = $pdo->prepare("
            SELECT id FROM task_completions
            WHERE animal_id = :animal_id AND task_type = 'food' AND completed_date = :today
            LIMIT 1
        ");
        $foodCheck->execute([":animal_id" => $animal["id"], ":today" => $today]);
        $animal["food_done_today"] = !!$foodCheck->fetch();

        $waterCheck = $pdo->prepare("
            SELECT id FROM task_completions
            WHERE animal_id = :animal_id AND task_type = 'water' AND completed_date = :today
            LIMIT 1
        ");
        $waterCheck->execute([":animal_id" => $animal["id"], ":today" => $today]);
        $animal["water_done_today"] = !!$waterCheck->fetch();

        // Sollwert heute erreicht? → Token vergeben falls noch nicht
        $neededgramms = (int)$animal["neededgramms"];

        if ($foodLevel >= $neededgramms && !$animal["food_done_today"]) {
            completeTask($pdo, $animal["id"], $animal["child_id"], "food", $today);
            $animal["food_done_today"] = true;
        }

        if ($waterLevel >= 50 && !$animal["water_done_today"]) {
            completeTask($pdo, $animal["id"], $animal["child_id"], "water", $today);
            $animal["water_done_today"] = true;
        }
    }

    echo json_encode(["status" => "success", "animals" => $animals]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

function completeTask($pdo, $animal_id, $child_id, $task_type, $today) {
    try {
        $insertStmt = $pdo->prepare("
            INSERT IGNORE INTO task_completions (animal_id, child_id, task_type, completed_date)
            VALUES (:animal_id, :child_id, :task_type, :today)
        ");
        $insertStmt->execute([
            ":animal_id" => $animal_id,
            ":child_id"  => $child_id,
            ":task_type" => $task_type,
            ":today"     => $today
        ]);

        // Nur Token vergeben wenn wirklich ein neuer Eintrag erstellt wurde
        if ($insertStmt->rowCount() > 0) {
            $tokenStmt = $pdo->prepare("UPDATE kids SET token = token + 2 WHERE id = :child_id");
            $tokenStmt->execute([":child_id" => $child_id]);
        }
    } catch (Exception $e) {
        // Duplicate key = bereits erledigt, ignorieren
    }
}
?>