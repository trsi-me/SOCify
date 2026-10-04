#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
إضافة بيانات تجريبية سريعة لحل مشكلة undefined
"""

import sqlite3
import json

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect('socify.db')
    conn.row_factory = sqlite3.Row
    return conn

def add_quick_data():
    """Add quick sample data"""
    conn = get_db_connection()
    
    try:
        # Add sample sources
        sources = [
            ('Server-Web-01', 'server', 'http://192.168.1.10:80', 'web-key-123', 1),
            ('IDS-01', 'ids', 'https://192.168.1.2:443', 'ids-key-456', 1),
            ('Firewall-01', 'firewall', 'https://192.168.1.1:443', 'fw-key-789', 1),
            ('Server-DB-01', 'database', 'mysql://192.168.1.20:3306', 'db-key-101', 1)
        ]
        
        for source in sources:
            conn.execute('''
                INSERT OR IGNORE INTO event_sources 
                (name, type, endpoint, api_key, is_active)
                VALUES (?, ?, ?, ?, ?)
            ''', source)
        
        # Add sample rules
        rules = [
            ('كشف فشل تسجيل الدخول المتكرر', 'كشف محاولات تسجيل الدخول الفاشلة المتكررة', 'authentication', '{"failed_logins": 5}', 'alert', '{"type": "email"}', 1, 1),
            ('كشف فحص المنافذ', 'كشف محاولات فحص المنافذ من عنوان واحد', 'network', '{"port_scan": 10}', 'log', '{"level": "warning"}', 1, 1),
            ('كشف هجوم DDoS', 'كشف زيادة غير طبيعية في الطلبات', 'network', '{"requests": 1000}', 'escalate', '{"level": "critical"}', 1, 1)
        ]
        
        for rule in rules:
            conn.execute('''
                INSERT OR IGNORE INTO rules 
                (name, description, condition_type, condition_value, action_type, action_value, is_active, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', rule)
        
        conn.commit()
        print("✅ تم إضافة البيانات التجريبية بنجاح!")
        
    except Exception as e:
        print(f"❌ خطأ: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    add_quick_data()
