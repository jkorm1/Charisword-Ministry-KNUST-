-- update_payments_table.sql

-- Add new columns to payments table
ALTER TABLE payments 
ADD COLUMN payment_category ENUM('service', 'program', 'regular') NOT NULL DEFAULT 'regular',
ADD COLUMN reference_id INT NULL, -- Will store service_id or program_id
ADD COLUMN reference_type ENUM('service', 'program') NULL,
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;

-- Create programs table
CREATE TABLE programs (
  program_id INT AUTO_INCREMENT PRIMARY KEY,
  program_name VARCHAR(100) NOT NULL,
  program_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_program_date (program_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create recurring_expenses table for regular service expenses
CREATE TABLE recurring_expenses (
  expense_id INT AUTO_INCREMENT PRIMARY KEY,
  expense_name VARCHAR(100) NOT NULL,
  default_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default recurring expenses
INSERT INTO recurring_expenses (expense_name, default_amount) VALUES
('Security', 40),
('Equipment', 404),
('Transport', 126),
('Cameras', 876),
('Charges', 9.98);
