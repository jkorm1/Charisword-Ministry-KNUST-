-- Create table to track expected attendance for each service
CREATE TABLE IF NOT EXISTS service_expected_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  service_id INT NOT NULL,
  member_id INT NOT NULL,
  member_status_at_time VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(service_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id),
  UNIQUE KEY (service_id, member_id)
);

-- Add an index for faster queries
CREATE INDEX idx_service_expected ON service_expected_attendance(service_id);

-- Add an index for member lookups
CREATE INDEX idx_member_expected ON service_expected_attendance(member_id);
