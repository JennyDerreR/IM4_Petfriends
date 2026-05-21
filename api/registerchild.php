<?php

require_once '../system/config.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: registerchild.html");
    exit;
}

if (empty($_POST["kidsname"])) {
    die("Fehler: Kein Name eingegeben.");
}

$kidsname = trim($_POST["kidsname"]);

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "INSERT INTO kids (kidsname) VALUES (:kidsname)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":kidsname" => $kidsname
    ]);

    header("Location: protected.html");
    exit;

} catch (PDOException $e) {
    echo "Fehler: " . $e->getMessage();
}

?>