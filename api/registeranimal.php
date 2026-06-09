<?php
// api/registeranimal.php
header("Content-Type: application/json; charset=UTF-8");
require_once '../system/config.php';
session_start();

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (empty($_SESSION["family_id"])) {
        echo json_encode(["status" => "error", "message" => "Keine Familie angemeldet"]);
        exit;
    }
    $family_id = (int) $_SESSION["family_id"];

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        
        // 1. SCHRITT: Finde dynamisch die Seriennummer (snr) des Tieres dieser Familie
        $bowlStmt = $pdo->prepare("
            SELECT snr FROM petbowls 
            WHERE family_id = :family_id 
            LIMIT 1
        ");
        $bowlStmt->execute([":family_id" => $family_id]);
        $bowl = $bowlStmt->fetch(PDO::FETCH_ASSOC);

        // Falls noch gar kein Tier/Napf registriert ist
        if (!$bowl || empty($bowl['snr'])) {
            echo json_encode([
                "status" => "success",
                "gewicht" => ["labels" => [date('H:i')], "values" => [0]],
                "feuchtigkeit" => ["labels" => [date('H:i')], "values" => [0]]
            ]);
            exit;
        }

        $dynamischeSnr = $bowl['snr']; // Das ist z.B. "PB-001" aus der petbowls-Tabelle

        // 2. SCHRITT: Hol die Sensordaten exakt für DIESE Seriennummer
        $stmt = $pdo->prepare("
            SELECT timestamp, filllevel, type 
            FROM `data` 
            WHERE snr = :snr 
            ORDER BY timestamp ASC 
            LIMIT 50
        ");
        $stmt->execute([":snr" => $dynamischeSnr]);
        
        $gewichtLabels = [];
        $gewichtValues = [];
        $feuchtigkeitLabels = [];
        $feuchtigkeitValues = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $zeit = date('H:i', strtotime($row['timestamp'])); 
            $sensorType = strtolower($row['type']);
            
            if (strpos($sensorType, 'gewicht') !== false) {
                $gewichtLabels[] = $zeit;
                $gewichtValues[] = (int)$row['filllevel'];
            } 
            elseif (strpos($sensorType, 'feucht') !== false) {
                $feuchtigkeitLabels[] = $zeit;
                $feuchtigkeitValues[] = (int)$row['filllevel'];
            }
        }
        
        // Fallback falls die Box existiert, aber noch keine Daten gesendet hat
        if (empty($gewichtLabels)) { $gewichtLabels[] = date('H:i'); $gewichtValues[] = 0; }
        if (empty($feuchtigkeitLabels)) { $feuchtigkeitLabels[] = date('H:i'); $feuchtigkeitValues[] = 0; }
        
        echo json_encode([
            "status" => "success",
            "gewicht" => [
                "labels" => $gewichtLabels,
                "values" => $gewichtValues
            ],
            "feuchtigkeit" => [
                "labels" => $feuchtigkeitLabels,
                "values" => $feuchtigkeitValues
            ]
        ]);
        exit;
    }

    // POST-Method zum Speichern bleibt unverändert...
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

        $stmt = $pdo->prepare("INSERT INTO petbowls (animal_name, type, snr, neededgramms, child_id, family_id, icon) VALUES (:animal_name, :type, :snr, :neededgramms, :child_id, :family_id, :icon)");
        $stmt->execute([":animal_name" => $animal_name, ":type" => $type, ":snr" => $snr, ":neededgramms" => $neededgramms, ":child_id" => $child_id, ":family_id" => $family_id, ":icon" => $icon]);

        echo json_encode(["status" => "success", "message" => "Tier erfolgreich gespeichert"]);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>