#!/usr/bin/env python3
"""
SOCify - SOC Simulation Platform
Run this script to start the application
"""

import os
import sys

def main():
    print("🚀 بدء تشغيل SOCify...")
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("❌ خطأ: يجب تشغيل السكريبت من مجلد SOCify")
        return
    
    # Check if database exists, if not create it
    if not os.path.exists('socify.db'):
        print("📊 إنشاء قاعدة البيانات...")
        try:
            from app import init_db
            init_db()
        except Exception as e:
            print(f"❌ خطأ في إنشاء قاعدة البيانات: {e}")
            return
    
    # Start the Flask application
    print("🌐 بدء تشغيل الخادم...")
    print("📍 العنوان: http://localhost:5000")
    print("🔑 بيانات الدخول:")
    print("   مدير النظام: admin@socify.local / admin123")
    print("   محلل أمني: analyst1@socify.local / password123")
    print("   مدير SOC: manager@socify.local / password123")
    print("\n⏹️  اضغط Ctrl+C لإيقاف الخادم")
    
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 تم إيقاف الخادم")
    except Exception as e:
        print(f"❌ خطأ في تشغيل الخادم: {e}")

if __name__ == '__main__':
    main()
