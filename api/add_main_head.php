<?php
ob_start();
header('Content-Type: application/json');

require_once 'config.php';

$goal_id = isset($_POST['goal_id']) ? trim($_POST['goal_id']) : '';
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$amount = isset($_POST['amount']) ? trim($_POST['amount']) : '';

if ($goal_id === '' || $name === '' || $amount === '') {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Goal ID, Main Head name, and amount are required.']);
    exit;
}

if (!is_numeric($amount) || (float)$amount <= 0) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'A valid positive amount is required.']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Validate amount against goal remaining
    $stmt = $pdo->prepare("SELECT amount FROM goals WHERE id = :goal_id FOR SHARE");
    $stmt->execute([':goal_id' => $goal_id]);
    $goalRow = $stmt->fetch();
    if (!$goalRow) {
        $pdo->rollBack();
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid Goal ID.']);
        exit;
    }
    $goal_amount = (float)$goalRow['amount'];

    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM main_heads WHERE goal_id = :goal_id");
    $stmt->execute([':goal_id' => $goal_id]);
    $totalRow = $stmt->fetch();
    $total_allocated = (float)($totalRow['total'] ?? 0);

    if ($total_allocated + (float)$amount > $goal_amount) {
        $pdo->rollBack();
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Insufficient funds: Main head amount exceeds available goal amount.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO main_heads (goal_id, name, amount) VALUES (:goal_id, :name, :amount)");
    $stmt->execute([
        ':goal_id' => $goal_id,
        ':name' => $name,
        ':amount' => $amount
    ]);

    $pdo->commit();
    ob_end_clean();
    echo json_encode(['success' => true, 'message' => 'Main Head added successfully']);
    exit;
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("add_main_head error: " . $e->getMessage());
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database error occurred while adding main head.']);
    exit;
}
?>