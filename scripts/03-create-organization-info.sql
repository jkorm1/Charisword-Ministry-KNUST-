-- Create organization_info table
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

-- Insert default organization info
INSERT INTO organization_info (name, address, phone, email) 
VALUES ('CHARISWORD CAMPUS MINISTRY', 'KNUST, Kumasi, Ghana', '+233 554 157 629 ', 'info@charisword.org')
ON DUPLICATE KEY UPDATE 
name = VALUES(name),
address = VALUES(address),
phone = VALUES(phone),
email = VALUES(email),
updated_at = CURRENT_TIMESTAMP;
