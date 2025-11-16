-- Charisword Gospel Ministry Database Schema
-- MySQL Database Setup for Railway
-- This file consolidates all table creation statements

USE railway;

-- ==================== CORE TABLES ====================

-- Users table (system users: admin, usher, cell_leader, finance_leader)
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'usher', 'cell_leader', 'finance_leader') NOT NULL,
  assigned_cell_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_assigned_cell (assigned_cell_id)
);

-- Cells table
CREATE TABLE IF NOT EXISTS cells (
  cell_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Folds table
CREATE TABLE IF NOT EXISTS folds (
  fold_id INT PRIMARY KEY AUTO_INCREMENT,
  cell_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cell_id) REFERENCES cells(cell_id) ON DELETE CASCADE,
  INDEX idx_cell_id (cell_id),
  INDEX idx_name (name)
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  member_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL,
  residence VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  cell_id INT,
  fold_id INT,
  inviter_member_id INT NULL,
  membership_status ENUM('Member', 'Associate', 'FirstTimer') DEFAULT 'Member',
  date_joined DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cell_id) REFERENCES cells(cell_id) ON DELETE SET NULL,
  FOREIGN KEY (fold_id) REFERENCES folds(fold_id) ON DELETE SET NULL,
  FOREIGN KEY (inviter_member_id) REFERENCES members(member_id) ON DELETE SET NULL,
  INDEX idx_full_name (full_name),
  INDEX idx_cell_id (cell_id),
  INDEX idx_fold_id (fold_id),
  INDEX idx_membership_status (membership_status),
  INDEX idx_phone (phone),
  INDEX idx_email (email)
);

-- First timers table
CREATE TABLE IF NOT EXISTS first_timers (
    first_timer_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    residence VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    inviter_member_id INT NULL,
    service_id INT NOT NULL,
    status ENUM('Visit', 'Stay') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inviter_member_id) REFERENCES members(member_id) ON DELETE SET NULL,
    INDEX idx_service_id (service_id),
    INDEX idx_status (status),
    INDEX idx_phone (phone),
    INDEX idx_email (email)
);

-- ==================== SERVICES & ATTENDANCE ====================

-- Services table
CREATE TABLE IF NOT EXISTS services (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_date DATE NOT NULL,
    service_type ENUM('Supergathering', 'Midweek', 'Special') NOT NULL,
    topic VARCHAR(255),
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_service_date (service_date),
    INDEX idx_service_type (service_type),
    INDEX idx_created_by (created_by_user_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    member_id INT NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    recorded_by_user_id INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_service_member (service_id, member_id),
    INDEX idx_service_id (service_id),
    INDEX idx_member_id (member_id),
    INDEX idx_status (status)
);

-- Service expected attendance table (tracks expected attendance)
CREATE TABLE IF NOT EXISTS service_expected_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_id INT NOT NULL,
  member_id INT NOT NULL,
  member_status_at_time VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  UNIQUE KEY unique_expected (service_id, member_id),
  INDEX idx_service_expected (service_id),
  INDEX idx_member_expected (member_id)
);


-- Attendance status history table
CREATE TABLE IF NOT EXISTS attendance_status_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  attendance_id INT NOT NULL,
  member_id INT NOT NULL,
  service_id INT NOT NULL,
  attendance_status ENUM('Present', 'Absent') NOT NULL,
  member_status_at_time ENUM('FirstTimer', 'Associate', 'Member') NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  previous_status ENUM('Present', 'Absent') NULL,
  FOREIGN KEY (attendance_id) REFERENCES attendance(attendance_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id),
  INDEX idx_member_service (member_id, service_id),
  INDEX idx_service_date (service_id, recorded_at)
);

-- ==================== PROGRAMS ====================

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  program_id INT AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(100) NOT NULL,
  program_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_program_date (program_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ==================== OFFERINGS ====================

-- Offerings table
CREATE TABLE IF NOT EXISTS offerings (
  offering_id INT PRIMARY KEY AUTO_INCREMENT,
  service_id INT NOT NULL,
  program_id INT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  recorded_by_user_id INT NOT NULL,
  date_recorded DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_service_id (service_id),
  INDEX idx_program_id (program_id),
  INDEX idx_date_recorded (date_recorded)
);

-- Add foreign key constraint for offerings
ALTER TABLE offerings 
ADD CONSTRAINT fk_offerings_program 
FOREIGN KEY (program_id) 
REFERENCES programs(program_id)
ON DELETE SET NULL;


-- ==================== PARTNERSHIPS ====================

-- Partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
  partnership_id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NULL,
  partner_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date_given DATE NOT NULL,
  recorded_by_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  service_id INT NULL,
  program_id INT NULL,
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL,
  FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_member_id (member_id),
  INDEX idx_date_given (date_given),
  INDEX idx_amount (amount)
);

-- Add foreign key constraints for partnerships
ALTER TABLE partnerships
ADD CONSTRAINT fk_partnerships_service
FOREIGN KEY (service_id) REFERENCES services(service_id)
ON DELETE SET NULL;

ALTER TABLE partnerships
ADD CONSTRAINT fk_partnerships_program
FOREIGN KEY (program_id) REFERENCES programs(program_id)
ON DELETE SET NULL;


-- Audit logs table
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    action_type VARCHAR(50) NOT NULL,
    target_table VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    performed_by_user_id INT NOT NULL,
    before_json JSON,
    after_json JSON,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    INDEX idx_action_type (action_type),
    INDEX idx_target_table (target_table),
    INDEX idx_performed_by (performed_by_user_id),
    INDEX idx_timestamp (timestamp)
);

-- ==================== ORGANIZATION INFO ====================

-- Organization information table
CREATE TABLE IF NOT EXISTS organization_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(100),
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key constraints that reference services table
ALTER TABLE first_timers ADD FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE;

-- Add foreign key constraint for users assigned_cell_id
ALTER TABLE users ADD FOREIGN KEY (assigned_cell_id) REFERENCES cells(cell_id) ON DELETE SET NULL;


-- Insert default organization info
INSERT INTO organization_info (name, address, phone, email) 
VALUES ('CHARISWORD CAMPUS MINISTRY', 'KNUST, Kumasi, Ghana', '+233 554 157 629 ', 'info@charisword.org') 
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  address = VALUES(address), 
  phone = VALUES(phone), 
  email = VALUES(email), 
  updated_at = CURRENT_TIMESTAMP;
