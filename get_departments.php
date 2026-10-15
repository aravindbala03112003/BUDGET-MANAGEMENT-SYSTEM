<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT id, name FROM departments ORDER BY name ASC");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($departments);
} catch (PDOException $e) {
    error_log("get_departments error: " . $e->getMessage());
    echo json_encode([]);
}
?>