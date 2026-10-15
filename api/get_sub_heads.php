<?php
header('Content-Type: application/json');
require_once 'config.php';

$main_head_id = isset($_GET['main_head_id']) ? trim($_GET['main_head_id']) : '';

if ($main_head_id === '') {
    echo json_encode([]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, description FROM sub_heads WHERE main_head_id = :main_head_id ORDER BY description ASC");
    $stmt->execute([':main_head_id' => $main_head_id]);
    $sub_heads = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sub_heads);
} catch (PDOException $e) {
    error_log("get_sub_heads error: " . $e->getMessage());
    echo json_encode([]);
}
?>