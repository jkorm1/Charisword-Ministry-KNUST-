CREATE TABLE IF NOT EXISTS attendance_status_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    attendance_id INT NOT NULL,
    member_id INT NOT NULL,
    service_id INT NOT NULL,
    attendance_status ENUM('Present', 'Absent') NOT NULL,
    member_status_at_time ENUM('FirstTimer', 'Associate', 'Member') NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attendance_id) REFERENCES attendance(attendance_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    INDEX idx_member_service (member_id, service_id),
    INDEX idx_service_date (service_id, recorded_at)
);
