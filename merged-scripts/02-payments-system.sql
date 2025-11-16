-- File: merged-scripts/02-payments-system.sql

USE railway;

-- Create payments table (corrected structure to match local)
CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  payment_type VARCHAR(50) NOT NULL,
  description TEXT,
  payment_category ENUM('service', 'program', 'regular') NOT NULL DEFAULT 'regular',
  reference_id INT NULL, -- Will store service_id or program_id
  reference_type ENUM('service', 'program') NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recorded_by_user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  
  -- Indexes for better query performance
  INDEX idx_payment_date (payment_date),
  INDEX idx_payment_type (payment_type),
  INDEX idx_payment_category (payment_category),
  INDEX idx_recorded_by (recorded_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Create recurring_expenses table for regular service expenses (corrected structure to match local)
CREATE TABLE recurring_expenses (
  expense_id INT AUTO_INCREMENT PRIMARY KEY,
  expense_name VARCHAR(100) NOT NULL,
  default_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Create indexes for partnerships
CREATE INDEX idx_partnerships_service ON partnerships(service_id);
CREATE INDEX idx_partnerships_program ON partnerships(program_id);
CREATE INDEX idx_partnerships_date ON partnerships(date_given);
CREATE INDEX idx_partnerships_member ON partnerships(member_id);

-- Insert default recurring expenses
INSERT INTO recurring_expenses (expense_name, default_amount) VALUES
('Security', 40),
('Equipment', 404),
('Transport', 126),
('Cameras', 876),
('Charges', 9.98);
