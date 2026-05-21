<?php

require_once("../system/config.php");

header("Content-Type: application/json");

$inputJSON = file_get_contents("php://input");
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Kein gültiges JSON empfangen"]);
    exit;
}

$filllevel = $input["filllevel"] ?? $input["wert"] ?? null;
$type = $input["type"] ?? null;
$snr = $input["snr"] ?? "unknown";

if ($filllevel === null || $type === null) {
    http_response_code(400);
    echo json_encode([
        "error" => "filllevel/wert und type müssen gesendet werden"
    ]);
    exit;
}

$sql = "INSERT INTO `data` (`filllevel`, `type`, `snr`) VALUES (?, ?, ?)";
$stmt = $pdo->prepare($sql);
$stmt->execute([$filllevel, $type, $snr]);

echo json_encode([
    "success" => true,
    "message" => "Daten wurden gespeichert",
    "filllevel" => $filllevel,
    "type" => $type,
    "snr" => $snr
]);

?>