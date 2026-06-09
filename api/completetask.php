<?php
// api/completetask.php
header("Content-Type: application/json; charset=UTF-8");
require_once '../system/config.php';
session_start();

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (empty($_SESSION["family_id"])) {
        echo json_encode(["status" => "error", "message" => "Nicht angemeldet"]);
        exit;
    }

    $data      = json_decode(file_get_contents("php://input"), true);
    $animal_id = isset($data["animal_id"]) ? (int)$data["animal_id"] : 0;
    $task_type = isset($data["task_type"]) ? trim($data["task_type"]) : "";

    if (!$animal_id || !in_array($task_type, ["food", "water"])) {
        echo json_encode(["status" => "error", "message" => "Ungültige Parameter"]);
        exit;
    }

    $family_id = (int)$_SESSION["family_id"];

    // Tier + Kind holen und prüfen ob es zur Familie gehört
    $animalStmt = $pdo->prepare("
        SELECT id, child_id FROM petbowls 
        WHERE id = :id AND family_id = :family_id
        LIMIT 1
    ");
    $animalStmt->execute([":id" => $animal_id, ":family_id" => $family_id]);
    $animal = $animalStmt->fetch(PDO::FETCH_ASSOC);

    if (!$animal) {
        echo json_encode(["status" => "error", "message" => "Tier nicht gefunden"]);
        exit;
    }

    $child_id = (int)$animal["child_id"];
    $today    = date("Y-m-d");

    // Prüfen ob heute schon erledigt
    $checkStmt = $pdo->prepare("
        SELECT id FROM task_completions
        WHERE animal_id = :animal_id
          AND task_type = :task_type
          AND completed_date = :today
        LIMIT 1
    ");
    $checkStmt->execute([
        ":animal_id" => $animal_id,
        ":task_type" => $task_type,
        ":today"     => $today
    ]);

    if ($checkStmt->fetch()) {
        // Heute schon erledigt — keine Token mehr
        echo json_encode(["status" => "already_done", "message" => "Heute bereits erledigt"]);
        exit;
    }

    // Eintrag in task_completions
    $insertStmt = $pdo->prepare("
        INSERT INTO task_completions (animal_id, child_id, task_type, completed_date)
        VALUES (:animal_id, :child_id, :task_type, :today)
    ");
    $insertStmt->execute([
        ":animal_id" => $animal_id,
        ":child_id"  => $child_id,
        ":task_type" => $task_type,
        ":today"     => $today
    ]);

    // 2 Token vergeben
    $tokenStmt = $pdo->prepare("
        UPDATE kids SET token = token + 2
        WHERE id = :child_id
    ");
    $tokenStmt->execute([":child_id" => $child_id]);

    echo json_encode([
        "status"  => "success",
        "message" => "Aufgabe erledigt, 2 Token vergeben"
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>