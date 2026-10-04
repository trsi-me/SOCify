#!/usr/bin/env python3
"""
SOCify Database Creation Script
"""

import sqlite3
import os
import bcrypt

def create_database():
    """Create SOCify database with all tables and sample data"""
    
    # Remove existing database if it exists
    if os.path.exists('socify.db'):
        os.remove('socify.db')
        print("تم حذف قاعدة البيانات الموجودة")
    
    # Create new database
    conn = sqlite3.connect('socify.db')
    conn.row_factory = sqlite3.Row
    
    print("جاري إنشاء قاعدة البيانات...")
    
    # Create tables
    conn.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'analyst' CHECK (role IN ('analyst', 'soc_manager', 'admin')),
            team VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    conn.execute('''
        CREATE TABLE security_events (
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
        )
    ''')
    
    conn.execute('''
        CREATE TABLE event_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            comment TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES security_events(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.execute('''
        CREATE TABLE rules (
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
        )
    ''')
    
    conn.execute('''
        CREATE TABLE audit_logs (
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
        )
    ''')
    
    conn.execute('''
        CREATE TABLE event_sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            endpoint VARCHAR(255),
            api_key VARCHAR(255),
            is_active INTEGER DEFAULT 1,
            last_sync TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes
    conn.execute('CREATE INDEX idx_users_email ON users(email)')
    conn.execute('CREATE INDEX idx_users_role ON users(role)')
    conn.execute('CREATE INDEX idx_events_severity ON security_events(severity)')
    conn.execute('CREATE INDEX idx_events_status ON security_events(status)')
    conn.execute('CREATE INDEX idx_events_timestamp ON security_events(timestamp)')
    conn.execute('CREATE INDEX idx_events_source ON security_events(source)')
    conn.execute('CREATE INDEX idx_audit_logs_user ON audit_logs(user_id)')
    conn.execute('CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp)')
    
    print("تم إنشاء الجداول بنجاح")
    
    # Insert default admin user
    admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    conn.execute('''
        INSERT INTO users (email, password_hash, name, role, team) 
        VALUES (?, ?, ?, ?, ?)
    ''', ('admin@socify.local', admin_password, 'مدير النظام', 'admin', 'IT Security'))
    
    # Insert sample users
    sample_users = [
        ('analyst1@socify.local', 'password123', 'أحمد محمد', 'analyst', 'فريق التحليل الأمني'),
        ('analyst2@socify.local', 'password123', 'فاطمة علي', 'analyst', 'فريق التحليل الأمني'),
        ('manager@socify.local', 'password123', 'خالد السعد', 'soc_manager', 'إدارة SOC')
    ]
    
    for email, password, name, role, team in sample_users:
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        conn.execute('''
            INSERT INTO users (email, password_hash, name, role, team)
            VALUES (?, ?, ?, ?, ?)
        ''', (email, password_hash, name, role, team))
    
    # Insert sample event sources
    conn.execute('''
        INSERT INTO event_sources (name, type, endpoint, is_active) VALUES
        ('Firewall-01', 'firewall', 'http://firewall-01.local/api/logs', 1),
        ('IDS-01', 'ids', 'http://ids-01.local/api/alerts', 1),
        ('Server-Web-01', 'server', 'http://web-01.local/api/logs', 1),
        ('Server-DB-01', 'server', 'http://db-01.local/api/logs', 1)
    ''')
    
    # Insert sample rules
    import json
    conn.execute('''
        INSERT INTO rules (name, description, condition_type, condition_value, action_type, action_value, created_by) VALUES
        (?, ?, ?, ?, ?, ?, ?)
    ''', ('Multiple Failed Logins', 'Detect multiple failed login attempts', 'failed_login_count', 
          json.dumps({"threshold": 5, "timeframe": "10m"}), 'create_event', 
          json.dumps({"severity": "high", "category": "authentication"}), 1))
    
    conn.execute('''
        INSERT INTO rules (name, description, condition_type, condition_value, action_type, action_value, created_by) VALUES
        (?, ?, ?, ?, ?, ?, ?)
    ''', ('Suspicious Network Activity', 'Detect unusual network patterns', 'network_anomaly', 
          json.dumps({"threshold": 0.8}), 'create_event', 
          json.dumps({"severity": "medium", "category": "network"}), 1))
    
    conn.execute('''
        INSERT INTO rules (name, description, condition_type, condition_value, action_type, action_value, created_by) VALUES
        (?, ?, ?, ?, ?, ?, ?)
    ''', ('Critical System Error', 'Detect critical system errors', 'error_level', 
          json.dumps({"level": "critical"}), 'create_event', 
          json.dumps({"severity": "critical", "category": "system"}), 1))
    
    conn.commit()
    conn.close()
    
    print("✅ تم إنشاء قاعدة البيانات بنجاح!")
    print("\n🔑 بيانات الدخول الافتراضية:")
    print("مدير النظام: admin@socify.local / admin123")
    print("محلل أمني: analyst1@socify.local / password123")
    print("مدير SOC: manager@socify.local / password123")

if __name__ == '__main__':
    create_database()
