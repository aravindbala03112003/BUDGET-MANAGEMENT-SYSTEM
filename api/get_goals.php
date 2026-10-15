<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT id, year FROM goals ORDER BY year DESC, id DESC");
    $goals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($goals);
} catch (PDOException $e) {
    error_log("get_goals error: " . $e->getMessage());
    echo json_encode([]);
}
?>