<?php
ob_start();
header('Content-Type: application/json');

require_once 'config.php';

$year = isset($_POST['year']) ? trim($_POST['year']) : '';
$amount = isset($_POST['amount']) ? trim($_POST['amount']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';

if ($year === '' || $amount === '' || $description === '') {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Year, amount, and description are required.']);
    exit;
}

if (!is_numeric($year) || !is_numeric($amount) || (float)$amount <= 0) {
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Valid numeric year and positive amount are required.']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO goals (year, amount, description) VALUES (:year, :amount, :description)");
    $stmt->execute([
        ':year' => (int)$year,
        ':amount' => $amount,
        ':description' => $description
    ]);

    ob_end_clean();
    echo json_encode(['success' => true, 'message' => 'Goal added successfully']);
    exit;
} catch (PDOException $e) {
    error_log("add_goal error: " . $e->getMessage());
    ob_end_clean();
    echo json_encode(['success' => false, 'message' => 'Database error occurred while adding goal.']);
    exit;
}
?>