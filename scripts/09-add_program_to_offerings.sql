-- File: migrations/add_program_to_offerings.sql

-- Add program_id column to offerings table
ALTER TABLE offerings 
ADD COLUMN program_id INT NULL 
AFTER service_id;

-- Add foreign key constraint
ALTER TABLE offerings 
ADD CONSTRAINT fk_offerings_program 
FOREIGN KEY (program_id) 
REFERENCES programs(program_id)
ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_offerings_program_id 
ON offerings(program_id);
