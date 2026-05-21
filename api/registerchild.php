<?php

header("Content-Type: application/json; charset=UTF-8");

require_once '../system/config.php';

session_start();

$family_id = $_SESSION["family_id"];

try {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {

        echo json_encode([
            "status" => "error",
            "message" => "Keine JSON-Daten empfangen"
        ]);

        exit;
    }

    if (empty($data["kidsname"])) {

        echo json_encode([
            "status" => "error",
            "message" => "Kein Name eingegeben"
        ]);

        exit;
    }

    $kidsname = trim($data["kidsname"]);

    $pdo = new PDO(
        "mysql:host=$dbhost;dbname=$db_name;charset=utf8mb4",
        $dbuser,
        $dbpass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":kidsname" => $kidsname,
        ":family_id" => $family_id
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