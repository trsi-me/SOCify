#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SOCify - إضافة بيانات تجريبية للأحداث والقواعد
"""

import sqlite3
import bcrypt
import uuid
import datetime
import random

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('SOCify/socify.db')
    conn.row_factory = sqlite3.Row
    return conn

def add_sample_events():
    """Add sample security events"""
    conn = get_db_connection()
    
    # Sample events data
    sample_events = [
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'firewall',
            'severity': 'critical',
            'category': 'DDoS Attack',
            'title': 'هجوم DDoS مكثف على خادم الويب الرئيسي',
            'description': 'تم رصد زيادة غير طبيعية في الطلبات من عناوين IP متعددة تستهدف خادم الويب الرئيسي. معدل الطلبات تجاوز 10,000 طلب في الثانية.',
            'raw_data': '{"src_ips": ["192.168.1.100", "10.0.0.50", "172.16.0.25"], "requests_per_sec": 10500, "target": "web-server-01", "duration": "15 minutes"}',
            'status': 'open',
            'assigned_to': 1,
            'created_by': 1
        },
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'ids',
            'severity': 'high',
            'category': 'Brute Force',
            'title': 'محاولات تسجيل دخول مشبوهة متكررة',
            'description': 'تم رصد 25 محاولة تسجيل دخول فاشلة من عنوان IP واحد خلال 10 دقائق على حساب مدير النظام.',
            'raw_data': '{"src_ip": "203.0.113.45", "target_user": "admin", "failed_attempts": 25, "time_window": "10 minutes", "usernames_tried": ["admin", "root", "administrator"]}',
            'status': 'investigating',
            'assigned_to': 2,
            'created_by': 1
        },
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'server',
            'severity': 'medium',
            'category': 'SQL Injection',
            'title': 'محاولة حقن SQL في نموذج تسجيل الدخول',
            'description': 'تم رصد محاولة حقن SQL في نموذج تسجيل الدخول. الاستعلام المشبوه يحتوي على أحرف خاصة.',
            'raw_data': '{"url": "/login", "payload": "\' OR \'1\'=\'1", "src_ip": "198.51.100.25", "user_agent": "Mozilla/5.0", "timestamp": "2024-01-20 14:30:00"}',
            'status': 'open',
            'assigned_to': 1,
            'created_by': 1
        },
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'firewall',
            'severity': 'high',
            'category': 'Port Scan',
            'title': 'فحص منافذ مشبوه من عنوان خارجي',
            'description': 'تم رصد محاولة فحص المنافذ من عنوان IP خارجي. تم فحص 50 منفذ مختلف خلال 5 دقائق.',
            'raw_data': '{"src_ip": "185.199.108.153", "ports_scanned": [22, 80, 443, 3389, 5432], "scan_duration": "5 minutes", "total_ports": 50}',
            'status': 'open',
            'assigned_to': 2,
            'created_by': 1
        },
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'ids',
            'severity': 'critical',
            'category': 'Malware',
            'title': 'رصد برنامج ضار في خادم قاعدة البيانات',
            'description': 'تم رصد نشاط مشبوه يشير إلى وجود برنامج ضار في خادم قاعدة البيانات. تم اكتشاف اتصالات غير مصرح بها.',
            'raw_data': '{"server": "db-server-01", "malware_type": "trojan", "connections": ["192.168.1.200:4444", "10.0.0.100:8080"], "files_modified": ["/etc/passwd", "/var/log/auth.log"]}',
            'status': 'investigating',
            'assigned_to': 1,
            'created_by': 1
        },
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'manual',
            'severity': 'low',
            'category': 'Policy Violation',
            'title': 'انتهاك سياسة استخدام الإنترنت',
            'description': 'تم رصد محاولة الوصول لموقع غير مصرح به من موظف في قسم المحاسبة.',
            'raw_data': '{"user": "accounting_user_01", "blocked_url": "social-media-site.com", "department": "Accounting", "time": "2024-01-20 11:45:00"}',
            'status': 'resolved',
            'assigned_to': 3,
            'created_by': 2
        },
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'firewall',
            'severity': 'medium',
            'category': 'Unauthorized Access',
            'title': 'محاولة وصول غير مصرح به لخادم الملفات',
            'description': 'تم رصد محاولة وصول غير مصرح به لخادم الملفات من عنوان IP خارجي.',
            'raw_data': '{"src_ip": "203.0.113.100", "target": "file-server-01", "protocol": "SMB", "port": 445, "attempts": 3}',
            'status': 'open',
            'assigned_to': 1,
            'created_by': 1
        },
        {
            'event_id': f'EVT-{uuid.uuid4().hex[:8].upper()}',
            'source': 'ids',
            'severity': 'high',
            'category': 'Data Exfiltration',
            'title': 'محاولة تسريب بيانات حساسة',
            'description': 'تم رصد محاولة نقل ملفات حساسة إلى خادم خارجي. حجم البيانات المنقولة: 500 MB.',
            'raw_data': '{"src_ip": "192.168.1.150", "dest_ip": "external-server.com", "data_size": "500MB", "file_types": [".xlsx", ".pdf", ".docx"], "sensitive_files": 15}',
            'status': 'investigating',
            'assigned_to': 1,
            'created_by': 1
        }
    ]
    
    try:
        for event in sample_events:
            conn.execute('''
                INSERT INTO security_events 
                (event_id, source, severity, category, title, description, raw_data, status, assigned_to, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                event['event_id'],
                event['source'],
                event['severity'],
                event['category'],
                event['title'],
                event['description'],
                event['raw_data'],
                event['status'],
                event['assigned_to'],
                event['created_by']
            ))
        
        conn.commit()
        print("✅ تم إضافة 8 أحداث تجريبية بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ في إضافة الأحداث: {e}")
        conn.rollback()
    finally:
        conn.close()

def add_sample_rules():
    """Add sample detection rules"""
    conn = get_db_connection()
    
    sample_rules = [
        {
            'name': 'كشف فشل تسجيل الدخول المتكرر',
            'description': 'كشف محاولات تسجيل الدخول الفاشلة المتكررة من نفس العنوان',
            'condition_type': 'authentication',
            'condition_value': '{"failed_logins": 5, "time_window": 600}',
            'action_type': 'alert',
            'action_value': '{"type": "email", "recipients": ["admin@socify.com"]}',
            'is_active': 1,
            'created_by': 1
        },
        {
            'name': 'كشف فحص المنافذ',
            'description': 'كشف محاولات فحص المنافذ من عنوان واحد',
            'condition_type': 'network',
            'condition_value': '{"port_scan_attempts": 10, "time_window": 300}',
            'action_type': 'log',
            'action_value': '{"level": "warning", "log_file": "security.log"}',
            'is_active': 1,
            'created_by': 1
        },
        {
            'name': 'كشف هجوم DDoS',
            'description': 'كشف زيادة غير طبيعية في الطلبات من عناوين متعددة',
            'condition_type': 'network',
            'condition_value': '{"requests_per_second": 1000, "unique_ips": 100}',
            'action_type': 'escalate',
            'action_value': '{"escalation_level": "critical", "notify": ["manager@socify.com"]}',
            'is_active': 1,
            'created_by': 1
        },
        {
            'name': 'كشف حقن SQL',
            'description': 'كشف محاولات حقن SQL في استعلامات قاعدة البيانات',
            'condition_type': 'application',
            'condition_value': '{"sql_patterns": ["\'", "OR", "UNION", "DROP"]}',
            'action_type': 'block',
            'action_value': '{"block_duration": 3600, "notify_admin": true}',
            'is_active': 1,
            'created_by': 1
        },
        {
            'name': 'كشف الوصول غير المصرح به',
            'description': 'كشف محاولات الوصول لملفات حساسة',
            'condition_type': 'system',
            'condition_value': '{"sensitive_files": ["/etc/passwd", "/var/log/auth.log"]}',
            'action_type': 'alert',
            'action_value': '{"type": "immediate", "recipients": ["security@socify.com"]}',
            'is_active': 1,
            'created_by': 1
        }
    ]
    
    try:
        for rule in sample_rules:
            conn.execute('''
                INSERT INTO rules 
                (name, description, condition_type, condition_value, action_type, action_value, is_active, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                rule['name'],
                rule['description'],
                rule['condition_type'],
                rule['condition_value'],
                rule['action_type'],
                rule['action_value'],
                rule['is_active'],
                rule['created_by']
            ))
        
        conn.commit()
        print("✅ تم إضافة 5 قواعد تجريبية بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ في إضافة القواعد: {e}")
        conn.rollback()
    finally:
        conn.close()

def add_sample_sources():
    """Add sample data sources"""
    conn = get_db_connection()
    
    sample_sources = [
        {
            'name': 'Server-Web-01',
            'type': 'server',
            'endpoint': 'http://192.168.1.10:80',
            'api_key': 'web-server-api-key-123',
            'is_active': 1
        },
        {
            'name': 'IDS-01',
            'type': 'ids',
            'endpoint': 'https://192.168.1.2:443',
            'api_key': 'ids-api-key-456',
            'is_active': 1
        },
        {
            'name': 'Firewall-01',
            'type': 'firewall',
            'endpoint': 'https://192.168.1.1:443',
            'api_key': 'firewall-api-key-789',
            'is_active': 1
        },
        {
            'name': 'Server-DB-01',
            'type': 'database',
            'endpoint': 'mysql://192.168.1.20:3306',
            'api_key': 'db-server-api-key-101',
            'is_active': 1
        },
        {
            'name': 'Mail-Server-01',
            'type': 'mail',
            'endpoint': 'smtp://192.168.1.30:25',
            'api_key': 'mail-server-api-key-202',
            'is_active': 1
        },
        {
            'name': 'Monitoring-System',
            'type': 'monitoring',
            'endpoint': 'http://192.168.1.40:8080',
            'api_key': 'monitoring-api-key-303',
            'is_active': 1
        },
        {
            'name': 'Backup-Server',
            'type': 'backup',
            'endpoint': 'ftp://192.168.1.50:21',
            'api_key': 'backup-api-key-404',
            'is_active': 0
        },
        {
            'name': 'Analytics-Engine',
            'type': 'analytics',
            'endpoint': 'http://192.168.1.60:9090',
            'api_key': 'analytics-api-key-505',
            'is_active': 1
        }
    ]
    
    try:
        for source in sample_sources:
            conn.execute('''
                INSERT INTO event_sources 
                (name, type, endpoint, api_key, is_active)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                source['name'],
                source['type'],
                source['endpoint'],
                source['api_key'],
                source['is_active']
            ))
        
        conn.commit()
        print("✅ تم إضافة 8 مصادر بيانات تجريبية بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ في إضافة مصادر البيانات: {e}")
        conn.rollback()
    finally:
        conn.close()

def add_sample_users():
    """Add additional sample users"""
    conn = get_db_connection()
    
    sample_users = [
        {
            'email': 'analyst1@socify.com',
            'password': 'password123',
            'name': 'أحمد المحلل',
            'role': 'analyst',
            'team': 'فريق التحليل الأمني'
        },
        {
            'email': 'analyst2@socify.com',
            'password': 'password123',
            'name': 'فاطمة الأمنية',
            'role': 'analyst',
            'team': 'فريق الاستجابة للحوادث'
        },
        {
            'email': 'manager@socify.com',
            'password': 'password123',
            'name': 'محمد المدير',
            'role': 'soc_manager',
            'team': 'إدارة SOC'
        },
        {
            'email': 'admin@socify.com',
            'password': 'password123',
            'name': 'سارة الإدارية',
            'role': 'admin',
            'team': 'إدارة النظام'
        }
    ]
    
    try:
        for user in sample_users:
            # Check if user already exists
            existing = conn.execute('SELECT id FROM users WHERE email = ?', (user['email'],)).fetchone()
            if existing:
                print(f"⚠️ المستخدم {user['email']} موجود بالفعل")
                continue
                
            password_hash = bcrypt.hashpw(user['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            conn.execute('''
                INSERT INTO users (email, password_hash, name, role, team)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                user['email'],
                password_hash,
                user['name'],
                user['role'],
                user['team']
            ))
        
        conn.commit()
        print("✅ تم إضافة المستخدمين الإضافيين بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ في إضافة المستخدمين: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    """Main function to add all sample data"""
    print("🚀 بدء إضافة البيانات التجريبية لـ SOCify...")
    print("=" * 50)
    
    # Add sample users
    print("\n📝 إضافة مستخدمين تجريبيين...")
    add_sample_users()
    
    # Add sample events
    print("\n🔍 إضافة أحداث أمنية تجريبية...")
    add_sample_events()
    
    # Add sample rules
    print("\n⚙️ إضافة قواعد كشف تجريبية...")
    add_sample_rules()
    
    # Add sample sources
    print("\n📡 إضافة مصادر بيانات تجريبية...")
    add_sample_sources()
    
    print("\n" + "=" * 50)
    print("🎉 تم إكمال إضافة جميع البيانات التجريبية!")
    print("\n📋 بيانات تسجيل الدخول:")
    print("👤 محلل: analyst1@socify.com / password123")
    print("👤 محلل: analyst2@socify.com / password123")
    print("👤 مدير: manager@socify.com / password123")
    print("👤 إداري: admin@socify.com / password123")
    print("👤 تجريبي: test@socify.com / password123")

if __name__ == '__main__':
    main()
