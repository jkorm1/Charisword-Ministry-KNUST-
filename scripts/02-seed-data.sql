-- Seed data for Charisword Gospel Ministry

USE chariswordKnust;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM attendance;
DELETE FROM offerings;
DELETE FROM partnerships;
DELETE FROM services;
DELETE FROM members;
DELETE FROM users;
DELETE FROM folds;
DELETE FROM cells;

ALTER TABLE cells AUTO_INCREMENT = 1;
ALTER TABLE folds AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE members AUTO_INCREMENT = 1;
ALTER TABLE services AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE partnerships AUTO_INCREMENT = 1;
ALTER TABLE offerings AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

START TRANSACTION;

-- Insert Cells
INSERT INTO cells (name, description) VALUES
('Zoe Cell', 'Life-giving cell focused on spiritual growth'),
('Shiloh Cell', 'Peaceful cell emphasizing community'),
('Makarios Cell', 'Blessed cell for fellowship'),
('Integrity Cell', 'Cell focused on character building'),
('Epignosis Cell', 'Knowledge-seeking cell for deeper understanding'),
('Dunamis Cell', 'Power cell for spiritual empowerment');

-- Insert Folds for each cell (3 folds per cell as specified)
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
(6, 'Power Fold', 'Spiritual power fold'),
(6, 'Strength Fold', 'Strength-building fold'),
(6, 'Victory Fold', 'Victory-focused fold');

-- Insert Admin User (password: admin123 - should be hashed in production)
INSERT INTO users (email, password_hash, role) VALUES
('admin@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'admin');

-- Insert sample ushers
INSERT INTO users (email, password_hash, role) VALUES
('usher1@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'usher'),
('usher2@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'usher');

-- Insert cell leaders (one for each cell)
INSERT INTO users (email, password_hash, role, assigned_cell_id) VALUES
('zoe.leader@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'cell_leader', 1),
('shiloh.leader@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'cell_leader', 2),
('makarios.leader@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'cell_leader', 3),
('integrity.leader@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'cell_leader', 4),
('epignosis.leader@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'cell_leader', 5),
('dunamis.leader@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'cell_leader', 6);
    
-- Insert finance leaders
INSERT INTO users (email, password_hash, role) VALUES
('finance1@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'finance_leader'),
('finance2@charisword.org', '$2b$12$71TD3cbdj4KdrYZ86pFHX.S0oK9R.yPGfYXSF1RO34WPYzEwDP.Ki'
, 'finance_leader');

-- Insert Members (sample from the provided list)
INSERT INTO members (full_name, gender, residence, phone, email, cell_id, fold_id, membership_status, date_joined) VALUES
('Min. Victus Kwaku', 'Male', 'KNUST Campus', '0261169859', 'victus@charisword.org', 1, 1, 'Member', '2023-01-15'),
('Min. Joshua Lamptey', 'Male', 'KNUST Campus', '0241234567', 'joshua@charisword.org', 1, 2, 'Member', '2023-02-10'),
('Min. Eugenia Nsaako', 'Female', 'KNUST Campus', '0551234567', 'eugenia@charisword.org', 2, 4, 'Member', '2023-01-20'),
('Min. Richmond', 'Male', 'KNUST Campus', '0201234567', 'richmond@charisword.org', 2, 5, 'Member', '2023-03-05'),
('Min. Ekow', 'Male', 'KNUST Campus', '0271234567', 'ekow@charisword.org', 3, 7, 'Member', '2023-02-15'),
('Min. Faustinus Deckor', 'Male', 'KNUST Campus', '0231234567', 'faustinus@charisword.org', 3, 8, 'Member', '2023-01-30'),
('Min. Kingsley Osei Bonsu', 'Male', 'KNUST Campus', '0501234567', 'kingsley@charisword.org', 4, 10, 'Member', '2023-02-20'),
('Min. MaryAnn', 'Female', 'KNUST Campus', '0541234567', 'maryann@charisword.org', 4, 11, 'Member', '2023-03-10'),
('Min. Alvina', 'Female', 'KNUST Campus', '0261234567', 'alvina@charisword.org', 5, 13, 'Member', '2023-01-25'),
('Min. Dorothy', 'Female', 'KNUST Campus', '0281234567', 'dorothy@charisword.org', 5, 14, 'Member', '2023-02-28'),
('Min. Harriet Adisenu', 'Female', 'KNUST Campus', '0211234567', 'harriet@charisword.org', 6, 16, 'Member', '2023-03-15'),
('Min. Pearl Dogli', 'Female', 'KNUST Campus', '0251234567', 'pearl@charisword.org', 6, 17, 'Member', '2023-01-10'),
('Min. Livingstone Sabah', 'Male', 'KNUST Campus', '0571234567', 'livingstone@charisword.org', 1, 3, 'Member', '2023-02-05'),
('Min. Eunice Betty Osei', 'Female', 'KNUST Campus', '0291234567', 'eunice@charisword.org', 2, 6, 'Member', '2023-03-20'),
('Min. Nana Yaw Amponsah', 'Male', 'KNUST Campus', '0221234567', 'nanayaw@charisword.org', 3, 9, 'Member', '2023-01-05');

-- Generate services for the year (Sundays and Tuesdays)
INSERT INTO services (service_date, service_type, created_by_user_id)
SELECT 
    DATE_ADD(CURRENT_DATE, INTERVAL seq DAY) as service_date,
    CASE DAYOFWEEK(DATE_ADD(CURRENT_DATE, INTERVAL seq DAY))
        WHEN 1 THEN 'Supergathering'  -- Sunday
        WHEN 3 THEN 'Midweek'         -- Tuesday
        ELSE NULL
    END as service_type,
    1 as created_by_user_id
FROM (
    SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
    UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
    UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
    UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24
    UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
    UNION SELECT 30
) as seq
WHERE 
    DATE_ADD(CURRENT_DATE, INTERVAL seq DAY) <= DATE_FORMAT(CURRENT_DATE, '%Y-12-31')
    AND DAYOFWEEK(DATE_ADD(CURRENT_DATE, INTERVAL seq DAY)) IN (1, 3);  -- Sunday (1) and Tuesday (3)


-- Insert sample attendance records
INSERT INTO attendance (service_id, member_id, status, recorded_by_user_id) VALUES
-- Service 1 attendance
(1, 1, 'Present', 2),
(1, 2, 'Present', 2),
(1, 3, 'Present', 2),
(1, 4, 'Absent', 2),
(1, 5, 'Present', 2),
-- Service 2 attendance
(2, 1, 'Present', 2),
(2, 2, 'Absent', 2),
(2, 3, 'Present', 2),
(2, 4, 'Present', 2),
(2, 5, 'Present', 2);

-- Insert sample partnerships
INSERT INTO partnerships (member_id, partner_name, amount, date_given, recorded_by_user_id) VALUES
(1, 'Min. Victus Kwaku', 500.00, '2024-01-01', 9),
(2, 'Min. Joshua Lamptey', 300.00, '2024-01-01', 9),
(3, 'Min. Eugenia Nsaako', 250.00, '2024-01-15', 9),
(5, 'Min. Ekow', 400.00, '2024-01-20', 9);

-- Insert sample offerings
INSERT INTO offerings (service_id, amount, recorded_by_user_id, date_recorded) VALUES
(1, 1250.00, 9, '2024-01-07'),
(2, 850.00, 9, '2024-01-10'),
(3, 1400.00, 9, '2024-01-14'),
(4, 950.00, 9, '2024-01-17'),
(5, 1600.00, 9, '2024-01-21');

COMMIT;
