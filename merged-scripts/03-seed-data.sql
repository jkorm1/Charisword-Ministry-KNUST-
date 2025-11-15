-- Seed data for Charisword Gospel Ministry

USE railway;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
DELETE FROM attendance_status_history;
DELETE FROM service_expected_attendance;
DELETE FROM attendance;
DELETE FROM offerings;
DELETE FROM partnerships;
DELETE FROM services;
DELETE FROM programs;
DELETE FROM payments;
DELETE FROM recurring_expenses;
DELETE FROM first_timers;
DELETE FROM members;
DELETE FROM users;
DELETE FROM folds;
DELETE FROM cells;

-- Reset AUTO_INCREMENT counters
ALTER TABLE cells AUTO_INCREMENT = 1;
ALTER TABLE folds AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE members AUTO_INCREMENT = 1;
ALTER TABLE services AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE partnerships AUTO_INCREMENT = 1;
ALTER TABLE offerings AUTO_INCREMENT = 1;
ALTER TABLE programs AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

START TRANSACTION;

-- ==================== INSERT CELLS ====================
INSERT INTO cells (name, description) VALUES 
  ('Zoe Cell', 'Life-giving cell focused on spiritual growth'),
  ('Shiloh Cell', 'Peaceful cell emphasizing community'),
  ('Makarios Cell', 'Blessed cell for fellowship'),
  ('Integrity Cell', 'Cell focused on character building'),
  ('Epignosis Cell', 'Knowledge-seeking cell for deeper understanding'),
  ('Dunamis Cell', 'Power cell for spiritual empowerment');

-- ==================== INSERT FOLDS ====================
INSERT INTO folds (cell_id, name, description) VALUES 
  -- Zoe Cell folds
  (1, 'Poiema Fold', 'Creative works fold'),
  (1, 'Love Fold', 'Love-centered fold'),
  (1, 'Wise Fold', 'Wisdom-seeking fold'),
  -- Shiloh Cell folds
  (2, 'Peace Fold', 'Peace-building fold'),
  (2, 'Unity Fold', 'Unity-focused fold'),
  (2, 'Harmony Fold', 'Harmonious fellowship fold'),
  -- Makarios Cell folds
  (3, 'Blessed Fold', 'Blessing-focused fold'),
  (3, 'Favor Fold', 'Divine favor fold'),
  (3, 'Grace Fold', 'Grace-centered fold'),
  -- Integrity Cell folds
  (4, 'Truth Fold', 'Truth-seeking fold'),
  (4, 'Honor Fold', 'Honor-focused fold'),
  (4, 'Virtue Fold', 'Virtue-building fold'),
  -- Epignosis Cell folds
  (5, 'Wisdom Fold', 'Wisdom-seeking fold'),
  (5, 'Knowledge Fold', 'Knowledge-building fold'),
  (5, 'Understanding Fold', 'Understanding-focused fold'),
  -- Dunamis Cell folds
  (6, 'Power Fold', 'Power-centered fold'),
  (6, 'Breakthrough Fold', 'Breakthrough-focused fold'),
  (6, 'Victory Fold', 'Victory-celebrating fold');

-- ==================== INSERT USERS ====================
INSERT INTO users (email, password_hash, role, assigned_cell_id) VALUES 
  ('admin@charisword.org', 'hashed_password_123', 'admin', NULL),
  ('usher@charisword.org', 'hashed_password_456', 'usher', 1),
  ('cell_leader@charisword.org', 'hashed_password_789', 'cell_leader', 2),
  ('finance@charisword.org', 'hashed_password_101', 'finance_leader', NULL);

-- ==================== INSERT MEMBERS ====================
INSERT INTO members (full_name, gender, residence, phone, email, cell_id, fold_id, membership_status, date_joined) VALUES 
  ('John Doe', 'Male', 'Kumasi', '0501234567', 'john@example.com', 1, 1, 'Member', '2024-01-15'),
  ('Jane Smith', 'Female', 'Kumasi', '0501234568', 'jane@example.com', 1, 2, 'Member', '2024-01-20'),
  ('Samuel Kwesi', 'Male', 'Accra', '0501234569', 'samuel@example.com', 2, 4, 'Associate', '2024-02-10'),
  ('Abena Mensah', 'Female', 'Kumasi', '0501234570', 'abena@example.com', 1, 1, 'Member', '2024-02-15'),
  ('David Osei', 'Male', 'Kumasi', '0501234571', 'david@example.com', 2, 5, 'Member', '2024-03-01'),
  ('Grace Anane', 'Female', 'Accra', '0501234572', 'grace@example.com', 3, 7, 'FirstTimer', '2024-03-15');

-- ==================== INSERT FIRST TIMERS ====================
INSERT INTO first_timers (member_id, invited_by_member_id, first_timer_comment) VALUES 
  (6, 1, 'Very welcoming community');

-- ==================== INSERT SERVICES ====================
INSERT INTO services (service_date, service_time, service_type, venue, speaker, topic) VALUES 
  ('2024-03-17', '9:00 AM', 'Sunday Service', 'KNUST Auditorium', 'Pastor John', 'Faith and Trust'),
  ('2024-03-24', '9:00 AM', 'Sunday Service', 'KNUST Auditorium', 'Pastor Jane', 'Grace and Mercy'),
  ('2024-03-31', '9:00 AM', 'Sunday Service', 'KNUST Auditorium', 'Pastor Samuel', 'Love and Compassion');

-- ==================== INSERT ATTENDANCE ====================
INSERT INTO attendance (service_id, member_id, attendance_status, member_status_at_time) VALUES 
  (1, 1, 'Present', 'Member'),
  (1, 2, 'Present', 'Member'),
  (1, 3, 'Absent', 'Associate'),
  (2, 1, 'Present', 'Member'),
  (2, 2, 'Absent', 'Member'),
  (2, 4, 'Present', 'Member'),
  (3, 1, 'Present', 'Member'),
  (3, 5, 'Present', 'Member'),
  (3, 6, 'Present', 'FirstTimer');

-- ==================== INSERT OFFERINGS ====================
INSERT INTO offerings (service_id, member_id, amount, offering_date, offering_type) VALUES 
  (1, 1, 100.00, '2024-03-17', 'Tithe'),
  (1, 2, 50.00, '2024-03-17', 'General Offering'),
  (2, 1, 100.00, '2024-03-24', 'Tithe'),
  (2, 4, 75.00, '2024-03-24', 'Special Offering'),
  (3, 1, 100.00, '2024-03-31', 'Tithe'),
  (3, 5, 50.00, '2024-03-31', 'General Offering');

-- ==================== INSERT PROGRAMS ====================
INSERT INTO programs (program_name, program_date, description) VALUES 
  ('Youth Retreat', '2024-04-15', 'Annual youth retreat and fellowship'),
  ('Prayer Conference', '2024-05-20', 'Spiritual empowerment conference'),
  ('Missions Outreach', '2024-06-10', 'Community outreach program');

-- ==================== INSERT PARTNERSHIPS ====================
INSERT INTO partnerships (member_id, date_given, amount, partnership_type, description) VALUES 
  (1, '2024-03-17', 500.00, 'Monthly Partnership', 'Regular monthly partnership'),
  (2, '2024-03-17', 250.00, 'Quarterly Partnership', 'Quarterly partnership commitment'),
  (4, '2024-03-24', 300.00, 'Project-based', 'Support for youth program');

COMMIT;
