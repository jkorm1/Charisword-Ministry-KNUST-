-- update_date_payments_table.sql
ALTER TABLE payments 
MODIFY COLUMN payment_date DATE NOT NULL DEFAULT CURRENT_DATE;
