-- SOCify Database Schema
-- Cybersecurity Operations Center Simulation Platform

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'analyst' CHECK (role IN ('analyst', 'soc_manager', 'admin')),
    team VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id VARCHAR(50) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    raw_data TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    assigned_to INTEGER,
    created_by INTEGER,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Event comments and collaboration
CREATE TABLE IF NOT EXISTS event_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES security_events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rules engine for automated event generation
CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_type VARCHAR(100) NOT NULL,
    condition_value TEXT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_value TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit trail for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Event sources configuration
CREATE TABLE IF NOT EXISTS event_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255),
    api_key VARCHAR(255),
    is_active INTEGER DEFAULT 1,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_events_status ON security_events(status);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_source ON security_events(source);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, name, role, team) 
VALUES ('admin@socify.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J5Kz8Kz8K', 'System Administrator', 'admin', 'IT Security');

-- Insert sample event sources
INSERT OR IGNORE INTO event_sources (name, type, endpoint, is_active) VALUES
('Firewall-01', 'firewall', 'http://firewall-01.local/api/logs', 1),
('IDS-01', 'ids', 'http://ids-01.local/api/alerts', 1),
('Server-Web-01', 'server', 'http://web-01.local/api/logs', 1),
('Server-DB-01', 'server', 'http://db-01.local/api/logs', 1);

-- Insert sample rules
INSERT OR IGNORE INTO rules (name, description, condition_type, condition_value, action_type, action_value, created_by) VALUES
('Multiple Failed Logins', 'Detect multiple failed login attempts', 'failed_login_count', '{"threshold": 5, "timeframe": "10m"}', 'create_event', '{"severity": "high", "category": "authentication"}', 1),
('Suspicious Network Activity', 'Detect unusual network patterns', 'network_anomaly', '{"threshold": 0.8}', 'create_event', '{"severity": "medium", "category": "network"}', 1),
('Critical System Error', 'Detect critical system errors', 'error_level', '{"level": "critical"}', 'create_event', '{"severity": "critical", "category": "system"}', 1);
