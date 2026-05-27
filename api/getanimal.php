<?php
session_start();
header('Content-Type: application/json');

require_once '../system/config.php';

$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

$action = $_GET['action'] ?? '';


// ── Tierdaten laden ────────────────────────────────────
// JS ruft auf: api/animal.php?action=get_animal&id=7
if ($action === 'get_animal') {

    $animal_id = (int)($_GET['id'] ?? 0);
    $family_id = $_SESSION['family_id'] ?? null;

    if (!$animal_id) {
        echo json_encode(['status' => 'error', 'message' => 'Tier-ID fehlt']);
        exit;
    }

    if (!$family_id) {
        echo json_encode(['status' => 'error', 'message' => 'Keine Familie gefunden']);
        exit;
    }

    $stmt = $pdo->prepare('
        SELECT 
            id,
            child_id,
            animal_name,
            snr,
            family_id,
            neededgramms,
            type,
            food_level,
            water_level
        FROM pets
        WHERE id = ? AND family_id = ?
    ');

    $stmt->execute([$animal_id, $family_id]);
    $animal = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$animal) {
        echo json_encode(['status' => 'error', 'message' => 'Tier nicht gefunden']);
        exit;
    }

    echo json_encode([
        'status' => 'ok',
        'animal' => $animal
    ]);
    exit;
}


// ── Fallback bei unbekannter Aktion ────────────────────
echo json_encode(['status' => 'error', 'message' => 'Unbekannte Aktion']);
exit;
?>