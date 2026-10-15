<?php
// Centralized Database Connection Module for PostgreSQL (PDO)
// Compatible with local PostgreSQL, Neon Serverless PostgreSQL, and Vercel

function get_db_connection(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // Optional: Load local .env file if it exists and variables aren't already set
    $env_file = __DIR__ . '/.env';
    if (!file_exists($env_file) && file_exists(__DIR__ . '/../.env')) {
        $env_file = __DIR__ . '/../.env';
    }
    if (file_exists($env_file)) {
        $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($key, $val) = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val, " \t\n\r\0\x0B\"'");
                if (getenv($key) === false) {
                    putenv("{$key}={$val}");
                    $_ENV[$key] = $val;
                }
            }
        }
    }

    // 1. Check for connection string in environment variables (Neon / Vercel style)
    $db_url = getenv('DATABASE_URL') ?: getenv('POSTGRES_URL') ?: getenv('POSTGRES_URL_NON_POOLING');

    if ($db_url) {
        $db_url = trim($db_url);
        // Clean out any UTF-8 BOM, zero-width characters, or non-printable ASCII
        $db_url = preg_replace('/[^\x20-\x7E]/', '', $db_url);
        $db_url = trim($db_url, " \t\n\r\0\x0B\"'");

        $parsed = parse_url($db_url);
        if ($parsed && !empty($parsed['host'])) {
            $host = $parsed['host'];
            $port = $parsed['port'] ?? 5432;
            $user = $parsed['user'] ?? '';
            $pass = $parsed['pass'] ?? '';
            $dbname = isset($parsed['path']) ? ltrim($parsed['path'], '/') : '';
            
            // Check query string for sslmode
            $sslmode = 'require';
            if (isset($parsed['query'])) {
                parse_str($parsed['query'], $query_params);
                if (isset($query_params['sslmode'])) {
                    $sslmode = $query_params['sslmode'];
                }
            }

            $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode={$sslmode}";

            // Auto-detect Neon endpoint ID for SNI compatibility
            if (preg_match('/^(ep-[a-z0-9-]+?)(?:-pooler)?\./i', $host, $matches)) {
                $endpointId = $matches[1];
                $dsn .= ";options='endpoint={$endpointId}'";
            }

            try {
                $pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
                return $pdo;
            } catch (PDOException $e) {
                error_log("Database connection failed via URL: " . $e->getMessage());
                // Fall through to try individual parameters if available
            }
        }
    }

    // 2. Check for individual environment variables or fallback to defaults
    $host = getenv('DB_HOST') ?: getenv('POSTGRES_HOST');
    if ($host) {
        $host = trim(preg_replace('/[^\x20-\x7E]/', '', $host));
    }
    if (!$host) {
        $host = '127.0.0.1';
    }
    $port = getenv('DB_PORT') ?: getenv('POSTGRES_PORT') ?: '5432';
    $dbname = getenv('DB_NAME') ?: getenv('POSTGRES_DATABASE') ?: 'budget_management1';
    $user = getenv('DB_USER') ?: getenv('POSTGRES_USER') ?: 'postgres';
    $pass = getenv('DB_PASS') ?: getenv('POSTGRES_PASSWORD') ?: '';
    $sslmode = getenv('DB_SSLMODE') ?: ($host && strpos($host, 'neon.tech') !== false ? 'require' : 'prefer');

    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode={$sslmode}";

    if (preg_match('/^(ep-[a-z0-9-]+?)(?:-pooler)?\./i', $host, $matches)) {
        $endpointId = $matches[1];
        $dsn .= ";options='endpoint={$endpointId}'";
    }

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed via individual params: " . $e->getMessage());
        throw $e;
    }
}

// Global initialization for existing script compatibility
try {
    $pdo = get_db_connection();
    $conn = $pdo;
} catch (Exception $e) {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }
    echo json_encode([
        'success' => false,
        'message' => 'Unable to connect to the database. Please verify configuration.'
    ]);
    exit;
}
?>