-- Seed Data Migration for University Budget Management System
-- Contains exact production records extracted from source MySQL database (budget_management1)

-- 1. Departments Seed Data
INSERT INTO departments (id, name) VALUES
(4, 'Computer Science and Engineering'),
(5, 'Information Technology'),
(6, 'Electronics and Communication Engineering'),
(7, 'Electrical and Electronics Engineering'),
(8, 'Mechanical Engineering'),
(9, 'Civil Engineering'),
(10, 'Chemical Engineering'),
(11, 'Instrumentation Engineering'),
(12, 'Mechatronics Engineering');

-- 2. Goals Seed Data
INSERT INTO goals (id, year, amount, description) VALUES
(20, 2024, 10000000.00, 'budget for 2024'),
(21, 2025, 1000000.00, '2025 budget'),
(22, 2025, 99999999.99, 'opening balance');

-- 3. Main Heads Seed Data
INSERT INTO main_heads (id, goal_id, name, amount) VALUES
(11, 20, 'ESST. & STAFF WELFARE EXPENSES ', 10000.00),
(12, 21, 'esst. staff', 1000.00),
(13, 22, 'canteen ', 70000.00);

-- 4. Sub Heads Seed Data
INSERT INTO sub_heads (id, main_head_id, amount, description) VALUES
(14, 11, 2000.00, 'SALARY'),
(15, 11, 3000.00, 'wages'),
(16, 12, 100.00, 'wages');

-- 5. Expenditures Seed Data
INSERT INTO expenditures (id, goal_id, sub_head_id, department_id, type, amount, date, description, cheque_number, bill_number) VALUES
(12, 20, 15, 9, 'Consumable', 1000.00, '2025-05-05', 'wages', '2324353678', 'PTU/FINANCE/05052025/0001'),
(13, 20, 15, 10, 'Consumable', 19.00, '2025-05-23', 'ohdwijd', '2324353678', 'PTU/FINANCE/23052025/0001'),
(14, 20, 14, 4, 'Consumable', 20.00, '2025-05-05', 'salary', '12345567', 'PTU/FINANCE/05052025/0002'),
(15, 20, 15, 4, 'Consumable', 800.00, '2026-07-07', 'wages', '21ca303', 'PTU/FINANCE/07072026/0001');

-- Reconcile Identity Sequences to ensure future inserts get correct auto-increment values
SELECT setval(pg_get_serial_sequence('departments', 'id'), COALESCE((SELECT MAX(id) FROM departments), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('goals', 'id'), COALESCE((SELECT MAX(id) FROM goals), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('main_heads', 'id'), COALESCE((SELECT MAX(id) FROM main_heads), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('sub_heads', 'id'), COALESCE((SELECT MAX(id) FROM sub_heads), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('expenditures', 'id'), COALESCE((SELECT MAX(id) FROM expenditures), 0) + 1, false);
