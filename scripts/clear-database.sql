-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables in correct order (child tables first)
DROP TABLE IF EXISTS attendance_status_history;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS service_expected_attendance;
DROP TABLE IF EXISTS offerings;
DROP TABLE IF EXISTS partnerships;
DROP TABLE IF EXISTS first_timers;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS folds;
DROP TABLE IF EXISTS cells;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS organization_info;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS recurring_expenses;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
