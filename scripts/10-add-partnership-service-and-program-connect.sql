-- Migration: Add Service and Program Associations to Partnerships
-- File: migrations/add_partnership_associations.sql

-- Add new columns to partnerships table
ALTER TABLE partnerships
ADD COLUMN service_id INT NULL,
ADD COLUMN program_id INT NULL;

-- Add foreign key constraints
ALTER TABLE partnerships
ADD CONSTRAINT fk_partnerships_service
FOREIGN KEY (service_id) REFERENCES services(service_id)
ON DELETE SET NULL;

ALTER TABLE partnerships
ADD CONSTRAINT fk_partnerships_program
FOREIGN KEY (program_id) REFERENCES programs(program_id)
ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_partnerships_service ON partnerships(service_id);
CREATE INDEX idx_partnerships_program ON partnerships(program_id);
CREATE INDEX idx_partnerships_date ON partnerships(date_given);
CREATE INDEX idx_partnerships_member ON partnerships(member_id);
