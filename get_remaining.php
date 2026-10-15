<?php
header('Content-Type: application/json');
require_once 'config.php';

$goal_id = isset($_GET['goal_id']) ? trim($_GET['goal_id']) : '';

if ($goal_id === '') {
    echo json_encode(['remaining' => 0]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT amount FROM goals WHERE id = :goal_id");
    $stmt->execute([':goal_id' => $goal_id]);
    $goal = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$goal) {
        echo json_encode(['remaining' => 0]);
        exit;
    }

    $goal_amount = (float)$goal['amount'];

    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM main_heads WHERE goal_id = :goal_id");
    $stmt->execute([':goal_id' => $goal_id]);
    $totalRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_allocated = (float)($totalRow['total'] ?? 0);

    $remaining = $goal_amount - $total_allocated;
    echo json_encode(['remaining' => $remaining]);
} catch (PDOException $e) {
    error_log("get_remaining error: " . $e->getMessage());
    echo json_encode(['remaining' => 0]);
}
?>