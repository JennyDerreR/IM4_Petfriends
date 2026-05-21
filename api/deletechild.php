<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

try {

    // JSON Daten holen
    $data = json_decode(
        file_get_contents("php://input"),
        true
    );

    // Prüfen ob ID vorhanden
    if (empty($data["kid_id"])) {

        echo json_encode([
            "status" => "error",
            "message" => "Keine Kind-ID erhalten"
        ]);

        exit;
    }

    // Werte holen
    $kid_id = (int) $data["kid_id"];
    $family_id = (int) $_SESSION["family_id"];

    // Datenbank verbinden
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    /*
      ZUERST:
      Alle verknüpften Näpfe löschen
    */
    $sql = "
        DELETE FROM petbowls
        WHERE child_id = :kid_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":kid_id" => $kid_id
    ]);

    /*
      DANACH:
      Kind löschen
    */
    $sql = "
        DELETE FROM kids
        WHERE id = :kid_id
        AND family_id = :family_id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":kid_id" => $kid_id,
        ":family_id" => $family_id
    ]);

    // Erfolg zurückgeben
    echo json_encode([
        "status" => "success"
    ]);

} catch (Exception $e) {

    // Fehler zurückgeben
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);

}
?>