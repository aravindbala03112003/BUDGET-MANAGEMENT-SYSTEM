<?php
header('Content-Type: application/json');
require_once 'config.php';

$goal_id = isset($_GET['goal_id']) ? trim($_GET['goal_id']) : '';

if ($goal_id === '') {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, name FROM main_heads WHERE goal_id = :goal_id ORDER BY name ASC");
    $stmt->execute([':goal_id' => $goal_id]);
    $main_heads = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($main_heads);
} catch (PDOException $e) {
    error_log("get_main_heads error: " . $e->getMessage());
    echo json_encode([]);
}
?>