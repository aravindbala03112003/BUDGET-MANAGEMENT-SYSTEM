<?php
ob_start();
header('Content-Type: application/json');

require_once 'config.php';

$main_head_id = isset($_POST['main_head_id']) ? trim($_POST['main_head_id']) : '';
$amount = isset($_POST['amount']) ? trim($_POST['amount']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';

if ($main_head_id === '' || $amount === '' || $description === '') {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Main Head ID, amount, and description are required.']);
    exit;
}

if (!is_numeric($amount) || (float)$amount <= 0) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'A valid positive amount is required.']);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT goal_id, amount FROM main_heads WHERE id = :main_head_id FOR SHARE");
    $stmt->execute([':main_head_id' => $main_head_id]);
    $mainHeadRow = $stmt->fetch();
    if (!$mainHeadRow) {
        $pdo->rollBack();
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid Main Head ID.']);
        exit;
    }
    $main_head_amount = (float)$mainHeadRow['amount'];

    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM sub_heads WHERE main_head_id = :main_head_id");
    $stmt->execute([':main_head_id' => $main_head_id]);
    $totalRow = $stmt->fetch();
    $total_allocated = (float)($totalRow['total'] ?? 0);

    if ($total_allocated + (float)$amount > $main_head_amount) {
        $pdo->rollBack();
        ob_end_clean();
        echo json_encode(['success' => false, 'message' => 'Insufficient funds: Sub-head amount exceeds available main head amount.']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO sub_heads (main_head_id, amount, description) VALUES (:main_head_id, :amount, :description)");
    $stmt->execute([
        ':main_head_id' => $main_head_id,
        ':amount' => $amount,
        ':description' => $description
    ]);

    $pdo->commit();
    ob_end_clean();
    echo json_encode(['success' => true, 'message' => 'Sub Head added successfully']);
    exit;
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("add_sub_head error: " . $e->getMessage());
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database error occurred while adding sub head.']);
    exit;
}
?>