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

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {

        $range    = isset($_GET['range']) ? (int)$_GET['range'] : 1;
        if (!in_array($range, [1, 7, 30])) $range = 1;

        $animalId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

        // SNR über animal-ID holen
        $bowlStmt = $pdo->prepare("
            SELECT snr FROM petbowls
            WHERE id = :id AND family_id = :family_id
            LIMIT 1
        ");
        $bowlStmt->execute([":id" => $animalId, ":family_id" => $family_id]);
        $bowl = $bowlStmt->fetch(PDO::FETCH_ASSOC);

        // Fallback: erste SNR der Familie
        if (!$bowl || empty($bowl['snr'])) {
            $bowlStmt = $pdo->prepare("SELECT snr FROM petbowls WHERE family_id = :family_id LIMIT 1");
            $bowlStmt->execute([":family_id" => $family_id]);
            $bowl = $bowlStmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$bowl || empty($bowl['snr'])) {
            echo json_encode([
                "status"       => "success",
                "gewicht"      => ["labels" => [date('H:i')], "values" => [0]],
                "feuchtigkeit" => ["labels" => [date('H:i')], "values" => [0]]
            ]);
            exit;
        }

        $snr = $bowl['snr'];

        // Heute → letzter Wert pro Stunde
        if ($range === 1) {
            $stmt = $pdo->prepare("
                SELECT
                    DATE_FORMAT(timestamp, '%H:00') as label,
                    SUBSTRING_INDEX(GROUP_CONCAT(filllevel ORDER BY timestamp DESC), ',', 1) as value,
                    type
                FROM data
                WHERE snr = :snr
                  AND filllevel >= 0
                  AND DATE(timestamp) = CURDATE()
                GROUP BY HOUR(timestamp), type
                ORDER BY HOUR(timestamp) ASC
            ");
            $stmt->execute([":snr" => $snr]);

        } else {
            // 7 oder 30 Tage → Durchschnitt pro Tag
            $stmt = $pdo->prepare("
                SELECT
                    DATE_FORMAT(DATE(timestamp), '%d.%m') as label,
                    ROUND(AVG(filllevel)) as value,
                    type
                FROM data
                WHERE snr = :snr
                  AND filllevel >= 0
                  AND timestamp >= NOW() - INTERVAL {$range} DAY
                GROUP BY DATE(timestamp), type
                ORDER BY DATE(timestamp) ASC
            ");
            $stmt->execute([":snr" => $snr]);
        }

        $gewichtLabels      = [];
        $gewichtValues      = [];
        $feuchtigkeitLabels = [];
        $feuchtigkeitValues = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $sensorType = strtolower($row['type']);
            if (strpos($sensorType, 'gewicht') !== false) {
                $gewichtLabels[]      = $row['label'];
                $gewichtValues[]      = (int)$row['value'];
            } elseif (strpos($sensorType, 'feucht') !== false) {
                $feuchtigkeitLabels[] = $row['label'];
                $feuchtigkeitValues[] = (int)$row['value'];
            }
        }

        if (empty($gewichtLabels))      { $gewichtLabels[]      = date('H:i'); $gewichtValues[]      = 0; }
        if (empty($feuchtigkeitLabels)) { $feuchtigkeitLabels[] = date('H:i'); $feuchtigkeitValues[] = 0; }

        echo json_encode([
            "status"       => "success",
            "gewicht"      => ["labels" => $gewichtLabels,      "values" => $gewichtValues],
            "feuchtigkeit" => ["labels" => $feuchtigkeitLabels, "values" => $feuchtigkeitValues]
        ]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || empty($data["animal_name"]) || empty($data["type"]) || empty($data["snr"]) || empty($data["neededgramms"]) || empty($data["child_id"])) {
            echo json_encode(["status" => "error", "message" => "Bitte alle Felder ausfüllen"]);
            exit;
        }

        $animal_name  = trim($data["animal_name"]);
        $type         = trim($data["type"]);
        $snr          = trim($data["snr"]);
        $neededgramms = trim($data["neededgramms"]);
        $child_id     = (int) $data["child_id"];
        $icon         = trim($data["icon"] ?? "dog");

        $checkChild = $pdo->prepare("SELECT id FROM kids WHERE id = :child_id AND family_id = :family_id");
        $checkChild->execute([":child_id" => $child_id, ":family_id" => $family_id]);

        if (!$checkChild->fetch()) {
            echo json_encode(["status" => "error", "message" => "Dieses Kind gehört nicht zu dieser Familie"]);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO petbowls (animal_name, type, snr, neededgramms, child_id, family_id, icon)
            VALUES (:animal_name, :type, :snr, :neededgramms, :child_id, :family_id, :icon)
        ");
        $stmt->execute([
            ":animal_name"  => $animal_name,
            ":type"         => $type,
            ":snr"          => $snr,
            ":neededgramms" => $neededgramms,
            ":child_id"     => $child_id,
            ":family_id"    => $family_id,
            ":icon"         => $icon
        ]);

        echo json_encode(["status" => "success", "message" => "Tier erfolgreich gespeichert"]);
        exit;
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>