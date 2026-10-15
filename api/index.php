<?php
// Unified Vercel Serverless Function Dispatcher
// Solves Vercel Hobby plan limit (max 12 serverless functions) while preserving all individual endpoint files

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$endpoint = isset($_GET['endpoint']) ? basename($_GET['endpoint']) : basename($requestPath);

$routes = [
    'get_goals.php' => __DIR__ . '/get_goals.php',
    'get_departments.php' => __DIR__ . '/get_departments.php',
    'get_department_name.php' => __DIR__ . '/get_department_name.php',
    'get_main_heads.php' => __DIR__ . '/get_main_heads.php',
    'get_sub_heads.php' => __DIR__ . '/get_sub_heads.php',
    'get_remaining.php' => __DIR__ . '/get_remaining.php',
    'get_main_head_remaining.php' => __DIR__ . '/get_main_head_remaining.php',
    'get_data.php' => __DIR__ . '/get_data.php',
    'add_goal.php' => __DIR__ . '/add_goal.php',
    'add_main_head.php' => __DIR__ . '/add_main_head.php',
    'add_sub_head.php' => __DIR__ . '/add_sub_head.php',
    'add_expenditure.php' => __DIR__ . '/add_expenditure.php',
    'confirm.php' => __DIR__ . '/confirm.php'
];

if (isset($routes[$endpoint]) && file_exists($routes[$endpoint])) {
    require $routes[$endpoint];
    exit;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode([
    'success' => false,
    'message' => "Endpoint '{$endpoint}' not found"
]);
?>
