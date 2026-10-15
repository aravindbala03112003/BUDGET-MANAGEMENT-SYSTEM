<?php
header('Content-Type: application/json');
require_once 'config.php';

$department_id = isset($_GET['department_id']) ? trim($_GET['department_id']) : '';

if ($department_id === '') {
    echo json_encode(['name' => 'Unknown']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT name FROM departments WHERE id = :id");
    $stmt->execute([':id' => $department_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        echo json_encode(['name' => $row['name']]);
    } else {
        echo json_encode(['name' => 'Unknown']);
    }
} catch (PDOException $e) {
    error_log("get_department_name error: " . $e->getMessage());
    echo json_encode(['name' => 'Unknown']);
}
?>