<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

try {

    // JSON Daten holen
    $data = json_decode(file_get_contents("php://input"), true);

    // Prüfen ob Daten vorhanden
    if (!$data) {

        echo json_encode([
            "status" => "error",
            "message" => "Keine JSON-Daten empfangen"
        ]);

        exit;
    }

    // Prüfen ob Name leer
    if (empty($data["kidsname"])) {

        echo json_encode([
            "status" => "error",
            "message" => "Kein Name eingegeben"
        ]);

        exit;
    }

    // Werte holen
    $kidsname = trim($data["kidsname"]);

    /*
      WICHTIG:
      Diese family_id muss in deiner Tabelle
      "families" existieren.
    */
    $family_id = 1;

    // Datenbank verbinden
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // SQL
    $sql = "
        INSERT INTO kids (
            kidsname,
            family_id
        )
        VALUES (
            :kidsname,
            :family_id
        )
    ";

    // Statement vorbereiten
    $stmt = $pdo->prepare($sql);

    // Ausführen
    $stmt->execute([
        ":kidsname" => $kidsname,
        ":family_id" => $family_id
    ]);

    // Erfolg zurückgeben
    echo json_encode([
        "status" => "success",
        "message" => "Kind erfolgreich gespeichert"
    ]);

} catch (Exception $e) {

    // Fehler zurückgeben
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);

}