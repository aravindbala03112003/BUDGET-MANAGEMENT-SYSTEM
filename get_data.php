<?php
require_once 'config.php';

$dept_id = isset($_GET['department_id']) ? trim($_GET['department_id']) : '';
$goal_id = isset($_GET['goal_id']) ? trim($_GET['goal_id']) : '';

$output = "<table border='1'><tr><th>Year</th><th>Main Head</th><th>Sub Head</th><th>Allocated</th><th>Expended</th><th>Remaining</th><th>Bill Details</th></tr>";

$params = [];
$whereClauses = [];

if ($dept_id !== '') {
    $whereClauses[] = "e.department_id = :dept_id";
    $params[':dept_id'] = $dept_id;
}

if ($goal_id !== '') {
    $whereClauses[] = "g.id = :goal_id";
    $params[':goal_id'] = $goal_id;
}

$whereSql = "";
if (!empty($whereClauses)) {
    $whereSql = "WHERE " . implode(" AND ", $whereClauses);
}

$sql = "
    SELECT 
        g.year, 
        mh.name AS main_head, 
        sh.description AS sub_head, 
        sh.amount AS allocated, 
        COALESCE(SUM(e.amount), 0) AS expended, 
        sh.amount - COALESCE(SUM(e.amount), 0) AS remaining, 
        COALESCE(STRING_AGG(e.bill_number || ' (' || CAST(e.amount AS TEXT) || ')', ', '), '') AS bills
    FROM goals g
    JOIN main_heads mh ON g.id = mh.goal_id
    JOIN sub_heads sh ON mh.id = sh.main_head_id
    LEFT JOIN expenditures e ON sh.id = e.sub_head_id
    {$whereSql}
    GROUP BY sh.id, g.year, mh.name, sh.description, sh.amount
    ORDER BY g.year DESC, mh.name ASC, sh.description ASC
";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $row) {
        $year = htmlspecialchars((string)$row['year'], ENT_QUOTES, 'UTF-8');
        $main_head = htmlspecialchars((string)$row['main_head'], ENT_QUOTES, 'UTF-8');
        $sub_head = htmlspecialchars((string)$row['sub_head'], ENT_QUOTES, 'UTF-8');
        $allocated = number_format((float)$row['allocated'], 2, '.', '');
        $expended = number_format((float)$row['expended'], 2, '.', '');
        $remaining = number_format((float)$row['remaining'], 2, '.', '');
        $bills = htmlspecialchars((string)$row['bills'], ENT_QUOTES, 'UTF-8');

        $output .= "<tr><td>{$year}</td><td>{$main_head}</td><td>{$sub_head}</td><td>{$allocated}</td><td>{$expended}</td><td>{$remaining}</td><td>{$bills}</td></tr>";
    }
} catch (PDOException $e) {
    error_log("get_data error: " . $e->getMessage());
    $output .= "<tr><td colspan='7'>Error generating report.</td></tr>";
}

$output .= "</table>";
echo $output;
?>