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


// ── AKTION 1: Familie + Mitglieder laden ──────────────
if ($action === 'get_family') {

    $family_id = $_SESSION['family_id'] ?? null;

    if (!$family_id) {
        echo json_encode(['status' => 'no_family']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT invite_code FROM families WHERE id = ?');
    $stmt->execute([$family_id]);
    $family = $stmt->fetch(PDO::FETCH_ASSOC);

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
if ($action === 'create_family') {

    $data = json_decode(file_get_contents('php://input'), true);
    $name = trim($data['name'] ?? '');

    if (!$name) {
        echo json_encode(['status' => 'error', 'message' => 'Name fehlt']);
        exit;
    }

    do {
        $code = 'FAM-' . strtoupper(substr(md5(uniqid()), 0, 5));
        $check = $pdo->prepare('SELECT id FROM families WHERE invite_code = ?');
        $check->execute([$code]);
    } while ($check->fetch());

    $stmt = $pdo->prepare('INSERT INTO families (name, invite_code) VALUES (?, ?)');
    $stmt->execute([$name, $code]);
    $family_id = $pdo->lastInsertId();

    $pdo->prepare('UPDATE users SET family_id = ? WHERE id = ?')
        ->execute([$family_id, $user_id]);

    $_SESSION['family_id'] = $family_id;

    echo json_encode(['status' => 'ok', 'family_id' => $family_id, 'invite_code' => $code]);
}


// ── AKTION 3: Per Code einer Familie beitreten ────────
if ($action === 'join_family') {

    $data = json_decode(file_get_contents('php://input'), true);
    $code = strtoupper(trim($data['invite_code'] ?? ''));

    $stmt = $pdo->prepare('SELECT id FROM families WHERE invite_code = ?');
    $stmt->execute([$code]);
    $family = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$family) {
        echo json_encode(['status' => 'error', 'message' => 'Ungültiger Code']);
        exit;
    }

    $pdo->prepare('UPDATE users SET family_id = ? WHERE id = ?')
        ->execute([$family['id'], $user_id]);

    $_SESSION['family_id'] = $family['id'];

    echo json_encode(['status' => 'ok', 'family_id' => $family['id']]);
}


// ── Mitglied entfernen ─────────────────────────────────
if ($action === 'remove_member') {
    $data = json_decode(file_get_contents('php://input'), true);
    $remove_user_id = (int)($data['remove_user_id'] ?? 0);

    $family_id = $_SESSION['family_id'] ?? null;
    if (!$family_id) {
        echo json_encode(['status' => 'error', 'message' => 'Keine Familie']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ? AND family_id = ?');
    $stmt->execute([$remove_user_id, $family_id]);
    if (!$stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'User nicht in dieser Familie']);
        exit;
    }

    $pdo->prepare('UPDATE users SET family_id = NULL WHERE id = ?')
        ->execute([$remove_user_id]);

    echo json_encode(['status' => 'ok']);
}


// ── Familie verlassen ──────────────────────────────────
if ($action === 'leave_family') {

    $family_id = $_SESSION['family_id'] ?? null;
    if (!$family_id) {
        echo json_encode(['status' => 'error', 'message' => 'Keine Familie']);
        exit;
    }

    // User aus Familie entfernen
    $pdo->prepare('UPDATE users SET family_id = NULL WHERE id = ?')
        ->execute([$user_id]);

    $_SESSION['family_id'] = null;

    // Prüfen ob noch andere Mitglieder in der Familie sind
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE family_id = ?');
    $stmt->execute([$family_id]);
    $count = $stmt->fetchColumn();

    // Wenn keine Mitglieder mehr → Familie löschen
    if ($count === 0) {
        $pdo->prepare('DELETE FROM families WHERE id = ?')->execute([$family_id]);
    }

    echo json_encode(['status' => 'ok']);
}


// ── Account löschen ────────────────────────────────────
if ($action === 'delete_account') {

    $family_id = $_SESSION['family_id'] ?? null;

    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$user_id]);

    // Wenn keine Mitglieder mehr → Familie löschen
    if ($family_id) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE family_id = ?');
        $stmt->execute([$family_id]);
        $count = $stmt->fetchColumn();
        if ($count === 0) {
            $pdo->prepare('DELETE FROM families WHERE id = ?')->execute([$family_id]);
        }
    }

    session_destroy();

    echo json_encode(['status' => 'ok']);
}
?>