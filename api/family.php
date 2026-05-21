<?php
// Wir starten die Session — so wissen wir wer eingeloggt ist
session_start();
header('Content-Type: application/json');

// config.php stellt die Datenbankverbindung ($pdo) bereit
require_once '../system/config.php';

// Wer ist eingeloggt? Das haben wir beim Login in der Session gespeichert
$user_id = $_SESSION['user_id'] ?? null;

// Wenn niemand eingeloggt ist → abbrechen
if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'Nicht eingeloggt']);
    exit;
}

// JS schickt immer ?action=... mit — so wissen wir was gewünscht ist
$action = $_GET['action'] ?? '';


// ── AKTION 1: Familie + Mitglieder laden ──────────────
// JS ruft auf: api/family.php?action=get_family
if ($action === 'get_family') {

    $family_id = $_SESSION['family_id'] ?? null;

    // User hat noch keine Familie → JS bekommt 'no_family' zurück
    if (!$family_id) {
        echo json_encode(['status' => 'no_family']);
        exit;
    }

    // Einladungscode der Familie aus DB holen
    $stmt = $pdo->prepare('SELECT invite_code FROM families WHERE id = ?');
    $stmt->execute([$family_id]);
    $family = $stmt->fetch(PDO::FETCH_ASSOC);

    // Alle User die zur gleichen Familie gehören
    $stmt2 = $pdo->prepare('SELECT id, firstname, lastname, email FROM users WHERE family_id = ?');
    $stmt2->execute([$family_id]);
    $members = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status'      => 'ok',
        'invite_code' => $family['invite_code'],
        'members'     => $members,
    ]);
}


// ── AKTION 2: Neue Familie erstellen ──────────────────
// JS ruft auf: api/family.php?action=create_family
if ($action === 'create_family') {

    // JS schickt den Familiennamen als JSON im Body mit
    $data = json_decode(file_get_contents('php://input'), true);
    $name = trim($data['name'] ?? '');

    if (!$name) {
        echo json_encode(['status' => 'error', 'message' => 'Name fehlt']);
        exit;
    }

    // Zufälligen Code generieren, z.B. "FAM-3KX9A"
    // Die do-while Schleife stellt sicher dass der Code noch nicht existiert
    do {
        $code = 'FAM-' . strtoupper(substr(md5(uniqid()), 0, 5));
        $check = $pdo->prepare('SELECT id FROM families WHERE invite_code = ?');
        $check->execute([$code]);
    } while ($check->fetch());

    // Familie in DB speichern
    $stmt = $pdo->prepare('INSERT INTO families (name, invite_code) VALUES (?, ?)');
    $stmt->execute([$name, $code]);
    $family_id = $pdo->lastInsertId(); // ID der neu erstellten Familie

    // Den eingeloggten User dieser Familie zuweisen
    $pdo->prepare('UPDATE users SET family_id = ? WHERE id = ?')
        ->execute([$family_id, $user_id]);

    // Family_id auch in der Session speichern
    $_SESSION['family_id'] = $family_id;

    echo json_encode(['status' => 'ok', 'family_id' => $family_id, 'invite_code' => $code]);
}


// ── AKTION 3: Per Code einer Familie beitreten ────────
// JS ruft auf: api/family.php?action=join_family
if ($action === 'join_family') {

    $data = json_decode(file_get_contents('php://input'), true);
    $code = strtoupper(trim($data['invite_code'] ?? '')); // Grossbuchstaben, Leerzeichen weg

    // Familie mit diesem Code in DB suchen
    $stmt = $pdo->prepare('SELECT id FROM families WHERE invite_code = ?');
    $stmt->execute([$code]);
    $family = $stmt->fetch(PDO::FETCH_ASSOC);

    // Code existiert nicht → Fehlermeldung
    if (!$family) {
        echo json_encode(['status' => 'error', 'message' => 'Ungültiger Code']);
        exit;
    }

    // User der gefundenen Familie zuweisen
    $pdo->prepare('UPDATE users SET family_id = ? WHERE id = ?')
        ->execute([$family['id'], $user_id]);

    $_SESSION['family_id'] = $family['id'];

    echo json_encode(['status' => 'ok', 'family_id' => $family['id']]);
}

// ── Mitglied entfernen ─────────────────────────────────
if ($action === 'remove_member') {
    $data = json_decode(file_get_contents('php://input'), true);
    $remove_user_id = (int)($data['remove_user_id'] ?? 0);

    // Sicherheit: nur eigene Familie — nicht fremde User entfernen
    $family_id = $_SESSION['family_id'] ?? null;
    if (!$family_id) {
        echo json_encode(['status' => 'error', 'message' => 'Keine Familie']);
        exit;
    }

    // Prüfen ob der zu entfernende User wirklich in dieser Familie ist
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ? AND family_id = ?');
    $stmt->execute([$remove_user_id, $family_id]);
    if (!$stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'User nicht in dieser Familie']);
        exit;
    }

    // family_id auf NULL setzen = aus Familie entfernt
    $pdo->prepare('UPDATE users SET family_id = NULL WHERE id = ?')
        ->execute([$remove_user_id]);

    echo json_encode(['status' => 'ok']);
}

// ── Account löschen ────────────────────────────────────
if ($action === 'delete_account') {

    // User aus der DB löschen
    // Die family_id wird einfach auf NULL gesetzt bei anderen Usern — die Familie bleibt
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$user_id]);

    // Session beenden
    session_destroy();

    echo json_encode(['status' => 'ok']);
}

?>