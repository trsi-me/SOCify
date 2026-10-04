#!/usr/bin/env python3
"""
SOCify Database Initialization Script
"""

import sqlite3
import os

def init_db():
    """Initialize database with schema"""
    # Remove existing database if it exists
    if os.path.exists('socify.db'):
        os.remove('socify.db')
        print("تم حذف قاعدة البيانات الموجودة")
    
    # Create new database
    conn = sqlite3.connect('socify.db')
    conn.row_factory = sqlite3.Row
    
    # Read and execute schema
    with open('schema.sql', 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    # Split by semicolon and execute each statement
    statements = schema_sql.split(';')
    for statement in statements:
        statement = statement.strip()
        if statement:
            try:
                conn.execute(statement)
            except sqlite3.Error as e:
                print(f"خطأ في تنفيذ SQL: {e}")
                print(f"البيان: {statement[:100]}...")
                raise
    
    conn.commit()
    conn.close()
    print("تم إنشاء قاعدة البيانات بنجاح!")

if __name__ == '__main__':
    init_db()
