<?php
header('Content-Type: application/json');
require_once 'config.php';

$year = isset($_POST['year']) ? trim($_POST['year']) : (isset($_GET['year']) ? trim($_GET['year']) : '');

if ($year === '') {
    echo json_encode(['success' => false, 'message' => 'Year not provided']);
    exit;
}

try {
    $goalStmt = $pdo->prepare("SELECT id FROM goals WHERE year = :year ORDER BY id DESC LIMIT 1");
    $goalStmt->execute([':year' => $year]);
    $goalRow = $goalStmt->fetch(PDO::FETCH_ASSOC);

    if ($goalRow) {
        $goalId = $goalRow['id'];

        $mainStmt = $pdo->prepare("SELECT id, name FROM main_heads WHERE goal_id = :goal_id ORDER BY name ASC");
        $mainStmt->execute([':goal_id' => $goalId]);
        $mainRows = $mainStmt->fetchAll(PDO::FETCH_ASSOC);

        $mainHeads = [];
        foreach ($mainRows as $mainRow) {
            $mainHeadId = $mainRow['id'];
            $mainHeadName = $mainRow['name'];

            $subStmt = $pdo->prepare("SELECT description FROM sub_heads WHERE main_head_id = :main_head_id ORDER BY description ASC");
            $subStmt->execute([':main_head_id' => $mainHeadId]);
            $subRows = $subStmt->fetchAll(PDO::FETCH_ASSOC);

            $subheads = [];
            foreach ($subRows as $subRow) {
                $subheads[] = $subRow['description'];
            }

            $mainHeads[] = [
                'main_head' => $mainHeadName,
                'subheads' => $subheads
            ];
        }

        echo json_encode([
            'success' => true,
            'data' => $mainHeads
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No goal found for the year.'
        ]);
    }
} catch (PDOException $e) {
    error_log("confirm.php error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error.'
    ]);
}
?>
