import sqlite3
import bcrypt
import uuid
import datetime

def add_sample_data():
    conn = sqlite3.connect('SOCify/socify.db')
    conn.row_factory = sqlite3.Row
    
    # Sample events
    events = [
        ('EVT-DDOS001', 'firewall', 'critical', 'DDoS Attack', 'هجوم DDoS مكثف على خادم الويب الرئيسي', 'تم رصد زيادة غير طبيعية في الطلبات من عناوين IP متعددة', '{"src_ips": ["192.168.1.100", "10.0.0.50"], "requests_per_sec": 10500}', 'open', 1, 1),
        ('EVT-BRUTE001', 'ids', 'high', 'Brute Force', 'محاولات تسجيل دخول مشبوهة متكررة', 'تم رصد 25 محاولة تسجيل دخول فاشلة من عنوان IP واحد', '{"src_ip": "203.0.113.45", "failed_attempts": 25}', 'investigating', 2, 1),
        ('EVT-SQL001', 'server', 'medium', 'SQL Injection', 'محاولة حقن SQL في نموذج تسجيل الدخول', 'تم رصد محاولة حقن SQL في نموذج تسجيل الدخول', '{"payload": "\' OR \'1\'=\'1", "src_ip": "198.51.100.25"}', 'open', 1, 1),
        ('EVT-SCAN001', 'firewall', 'high', 'Port Scan', 'فحص منافذ مشبوه من عنوان خارجي', 'تم رصد محاولة فحص المنافذ من عنوان IP خارجي', '{"src_ip": "185.199.108.153", "ports_scanned": [22, 80, 443]}', 'open', 2, 1),
        ('EVT-MAL001', 'ids', 'critical', 'Malware', 'رصد برنامج ضار في خادم قاعدة البيانات', 'تم رصد نشاط مشبوه يشير إلى وجود برنامج ضار', '{"server": "db-server-01", "malware_type": "trojan"}', 'investigating', 1, 1)
    ]
    
    for event in events:
        conn.execute('''
            INSERT INTO security_events 
            (event_id, source, severity, category, title, description, raw_data, status, assigned_to, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', event)
    
    # Sample rules
    rules = [
        ('كشف فشل تسجيل الدخول المتكرر', 'كشف محاولات تسجيل الدخول الفاشلة المتكررة', 'authentication', 'high', 'failed_logins > 5 AND time_window < 600', 'alert', 1, 1),
        ('كشف فحص المنافذ', 'كشف محاولات فحص المنافذ من عنوان واحد', 'network', 'medium', 'port_scan_attempts > 10 AND time_window < 300', 'log', 1, 1),
        ('كشف هجوم DDoS', 'كشف زيادة غير طبيعية في الطلبات', 'network', 'critical', 'requests_per_second > 1000 AND unique_ips > 100', 'escalate', 1, 1)
    ]
    
    for rule in rules:
        conn.execute('''
            INSERT INTO detection_rules 
            (name, description, category, severity, condition, action, enabled, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', rule)
    
    conn.commit()
    conn.close()
    print("تم إضافة البيانات التجريبية بنجاح!")

if __name__ == '__main__':
    add_sample_data()
