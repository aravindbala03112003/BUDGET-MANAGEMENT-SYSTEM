<?php
header('Content-Type: application/json');
require_once 'config.php';

$main_head_id = isset($_GET['main_head_id']) ? trim($_GET['main_head_id']) : '';

if ($main_head_id === '') {
    echo json_encode(['remaining' => 0]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT amount FROM main_heads WHERE id = :main_head_id");
    $stmt->execute([':main_head_id' => $main_head_id]);
    $mainHead = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$mainHead) {
        echo json_encode(['remaining' => 0]);
        exit;
    }

    $main_head_amount = (float)$mainHead['amount'];

    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM sub_heads WHERE main_head_id = :main_head_id");
    $stmt->execute([':main_head_id' => $main_head_id]);
    $totalRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_allocated = (float)($totalRow['total'] ?? 0);

    $remaining = $main_head_amount - $total_allocated;
    echo json_encode(['remaining' => $remaining]);
} catch (PDOException $e) {
    error_log("get_main_head_remaining error: " . $e->getMessage());
    echo json_encode(['remaining' => 0]);
}
?>