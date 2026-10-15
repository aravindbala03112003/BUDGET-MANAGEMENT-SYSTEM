<?php
require_once 'config.php';

// Receive POST values
$goal_id = isset($_POST['goal_id']) ? trim($_POST['goal_id']) : '';
$sub_head_id = isset($_POST['sub_head_id']) ? trim($_POST['sub_head_id']) : '';
$department_id = isset($_POST['department_id']) ? trim($_POST['department_id']) : '';
$type = isset($_POST['type']) ? trim($_POST['type']) : '';
$amount = isset($_POST['amount']) ? trim($_POST['amount']) : '';
$date = isset($_POST['date']) ? trim($_POST['date']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';
$cheque_number = isset($_POST['cheque_number']) ? trim($_POST['cheque_number']) : '';

if ($goal_id === '' || $sub_head_id === '' || $department_id === '' || $type === '' || 
    $amount === '' || $date === '' || $description === '' || $cheque_number === '') {
    echo "Error: All fields are required.";
    exit;
}

if (!is_numeric($amount) || (float)$amount <= 0) {
    echo "Error: Amount must be a positive number.";
    exit;
}

if (strcasecmp($type, 'consumable') === 0) {
    $type = 'Consumable';
} elseif (strcasecmp($type, 'non-consumable') === 0 || strcasecmp($type, 'non consumable') === 0) {
    $type = 'Non-Consumable';
} else {
    $type = 'Consumable'; // Default fallback safe for check constraint
}

try {
    $pdo->beginTransaction();

    // 1. Lock sub_head row to prevent concurrent over-expenditure
    $stmt = $pdo->prepare("SELECT amount FROM sub_heads WHERE id = :sub_head_id FOR UPDATE");
    $stmt->execute([':sub_head_id' => $sub_head_id]);
    $subHeadRow = $stmt->fetch();

    if (!$subHeadRow) {
        $pdo->rollBack();
        echo "Error: Invalid Sub Head ID.";
        exit;
    }

    $sub_head_allocated = (float)$subHeadRow['amount'];

    // 2. Calculate already expended amount for this sub_head
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) AS expended FROM expenditures WHERE sub_head_id = :sub_head_id");
    $stmt->execute([':sub_head_id' => $sub_head_id]);
    $expendedRow = $stmt->fetch();
    $already_expended = (float)($expendedRow['expended'] ?? 0);

    $remaining = $sub_head_allocated - $already_expended;

    if ((float)$amount > $remaining) {
        $pdo->rollBack();
        echo "Insufficient funds: The expenditure exceeds the available balance.";
        exit;
    }

    // 3. Format date for bill number (DDMMYYYY)
    $date_formatted = date('dmY', strtotime($date));

    // 4. Get next serial number for bill number on this date (PostgreSQL safe extraction)
    $stmt = $pdo->prepare("
        SELECT COALESCE(MAX(
            CASE 
                WHEN bill_number ~ '[0-9]{4}$' THEN CAST(SUBSTRING(bill_number FROM '[0-9]{4}$') AS INTEGER)
                ELSE 0
            END
        ), 0) + 1 AS next_serial 
        FROM expenditures 
        WHERE date = :date
    ");
    $stmt->execute([':date' => $date]);
    $serialRow = $stmt->fetch();
    $next_serial = str_pad((string)($serialRow['next_serial'] ?? 1), 4, '0', STR_PAD_LEFT);

    // 5. Generate bill number: PTU/FINANCE/{DDMMYYYY}/{SERIAL}
    $bill_number = "PTU/FINANCE/{$date_formatted}/{$next_serial}";

    // 6. Insert expenditure record
    $stmt = $pdo->prepare("
        INSERT INTO expenditures 
        (goal_id, sub_head_id, department_id, type, amount, date, description, cheque_number, bill_number) 
        VALUES 
        (:goal_id, :sub_head_id, :department_id, :type, :amount, :date, :description, :cheque_number, :bill_number)
    ");
    $stmt->execute([
        ':goal_id' => $goal_id,
        ':sub_head_id' => $sub_head_id,
        ':department_id' => $department_id,
        ':type' => $type,
        ':amount' => $amount,
        ':date' => $date,
        ':description' => $description,
        ':cheque_number' => $cheque_number,
        ':bill_number' => $bill_number
    ]);

    $pdo->commit();
    echo "Expenditure added with bill: {$bill_number}";

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("add_expenditure error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
    echo "Error: " . $e->getMessage();
}
?>
