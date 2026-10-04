from flask import Flask, request, jsonify, render_template, session, redirect, url_for, flash
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import json
import uuid
import datetime
import bcrypt
import os
from functools import wraps
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'socify-secret-key-change-in-production'
app.config['DATABASE'] = 'socify.db'

# Initialize extensions
CORS(app, origins=['http://localhost:5000', 'http://127.0.0.1:5000'])
csrf = CSRFProtect(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with schema"""
    try:
        # Import the database creation script
        import create_db
        create_db.create_database()
    except Exception as e:
        print(f"خطأ في إنشاء قاعدة البيانات: {e}")
        # Fallback to manual creation
        conn = get_db_connection()
        try:
            with open('schema.sql', 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            statements = schema_sql.split(';')
            for statement in statements:
                statement = statement.strip()
                if statement:
                    conn.execute(statement)
            conn.commit()
            print("تم إنشاء قاعدة البيانات بنجاح")
        except Exception as e2:
            print(f"خطأ في تنفيذ SQL: {e2}")
        finally:
            conn.close()

def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.is_json:
                return jsonify({'error': 'Authentication required'}), 401
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def role_required(required_role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                if request.is_json:
                    return jsonify({'error': 'Authentication required'}), 401
                return redirect(url_for('login'))
            
            conn = get_db_connection()
            user = conn.execute('SELECT role FROM users WHERE id = ?', (session['user_id'],)).fetchone()
            conn.close()
            
            if not user or user['role'] not in required_role:
                if request.is_json:
                    return jsonify({'error': 'Insufficient permissions'}), 403
                flash('Insufficient permissions', 'error')
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def log_audit(user_id, action, table_name, record_id=None, old_values=None, new_values=None):
    """Log audit trail"""
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, action, table_name, record_id, old_values, new_values, 
          request.remote_addr, request.headers.get('User-Agent')))
    conn.commit()
    conn.close()

# Routes
@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')

@app.route('/test')
def test():
    """Test page for UI testing"""
    return render_template('test.html')

@app.route('/lab')
@login_required
def lab():
    """Security simulation lab"""
    return render_template('lab.html')

@app.route('/rules')
@login_required
def rules():
    """Rules management page"""
    return render_template('rules.html')

@app.route('/profile')
@login_required
def profile():
    """User profile page"""
    return render_template('profile.html')

@app.template_filter('getRoleName')
def get_role_name(role):
    """Get role name in Arabic"""
    roles = {
        'analyst': 'محلل أمني',
        'soc_manager': 'مدير SOC',
        'admin': 'مدير النظام'
    }
    return roles.get(role, role)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            if request.is_json:
                return jsonify({'error': 'Email and password required'}), 400
            flash('Email and password required', 'error')
            return redirect(url_for('login'))
        
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ? AND is_active = 1', (email,)).fetchone()
        conn.close()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            session['user_id'] = user['id']
            session['user_email'] = user['email']
            session['user_name'] = user['name']
            session['user_role'] = user['role']
            
            # Update last login
            conn = get_db_connection()
            conn.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user['id'],))
            conn.commit()
            conn.close()
            
            log_audit(user['id'], 'login', 'users', user['id'])
            
            if request.is_json:
                return jsonify({'message': 'Login successful', 'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'role': user['role']
                }})
            return redirect(url_for('dashboard'))
        else:
            if request.is_json:
                return jsonify({'error': 'Invalid credentials'}), 401
            flash('Invalid credentials', 'error')
            return redirect(url_for('login'))
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        team = data.get('team', '')
        
        if not all([email, password, name]):
            if request.is_json:
                return jsonify({'error': 'All fields required'}), 400
            flash('All fields required', 'error')
            return redirect(url_for('register'))
        
        # Check if user exists
        conn = get_db_connection()
        existing_user = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        
        if existing_user:
            conn.close()
            if request.is_json:
                return jsonify({'error': 'User already exists'}), 400
            flash('User already exists', 'error')
            return redirect(url_for('register'))
        
        # Hash password and create user
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor = conn.execute('''
            INSERT INTO users (email, password_hash, name, role, team)
            VALUES (?, ?, ?, 'analyst', ?)
        ''', (email, password_hash, name, team))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        log_audit(user_id, 'register', 'users', user_id)
        
        if request.is_json:
            return jsonify({'message': 'Registration successful'})
        flash('Registration successful', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    """User logout"""
    if 'user_id' in session:
        log_audit(session['user_id'], 'logout', 'users', session['user_id'])
    session.clear()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard"""
    return render_template('dashboard.html')

# API Routes
@app.route('/api/events', methods=['GET'])
@login_required
def get_events():
    """Get security events with filtering"""
    conn = get_db_connection()
    
    # Get query parameters
    severity = request.args.get('severity')
    status = request.args.get('status')
    source = request.args.get('source')
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    
    # Build query
    query = '''
        SELECT se.*, u1.name as assigned_to_name, u2.name as created_by_name
        FROM security_events se
        LEFT JOIN users u1 ON se.assigned_to = u1.id
        LEFT JOIN users u2 ON se.created_by = u2.id
        WHERE 1=1
    '''
    params = []
    
    if severity:
        query += ' AND se.severity = ?'
        params.append(severity)
    
    if status:
        query += ' AND se.status = ?'
        params.append(status)
    
    if source:
        query += ' AND se.source = ?'
        params.append(source)
    
    query += ' ORDER BY se.timestamp DESC LIMIT ? OFFSET ?'
    params.extend([limit, offset])
    
    events = conn.execute(query, params).fetchall()
    conn.close()
    
    return jsonify([dict(event) for event in events])

@app.route('/api/events', methods=['POST'])
@login_required
def create_event():
    """Create new security event"""
    data = request.get_json()
    
    required_fields = ['source', 'severity', 'category', 'title', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
    
    cursor = conn.execute('''
        INSERT INTO security_events (event_id, source, severity, category, title, description, raw_data, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (event_id, data['source'], data['severity'], data['category'], 
          data['title'], data['description'], data.get('raw_data', ''), session['user_id']))
    
    # Get the created event ID before committing
    event_db_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    log_audit(session['user_id'], 'create', 'security_events', event_db_id, None, json.dumps(data))
    
    return jsonify({'message': 'Event created successfully', 'event_id': event_id, 'id': event_db_id})

@app.route('/api/events/<int:event_id>', methods=['PUT'])
@login_required
def update_event(event_id):
    """Update security event"""
    data = request.get_json()
    
    conn = get_db_connection()
    
    # Get current event
    current_event = conn.execute('SELECT * FROM security_events WHERE id = ?', (event_id,)).fetchone()
    if not current_event:
        conn.close()
        return jsonify({'error': 'Event not found'}), 404
    
    # Update event - allow updating more fields
    update_fields = []
    params = []
    
    updatable_fields = ['status', 'assigned_to', 'severity', 'title', 'description']
    for field in updatable_fields:
        if field in data:
            update_fields.append(f"{field} = ?")
            params.append(data[field])
    
    if update_fields:
        params.append(event_id)
        conn.execute(f"UPDATE security_events SET {', '.join(update_fields)} WHERE id = ?", params)
        conn.commit()
        
        # Get updated event for audit log
        updated_event = conn.execute('SELECT * FROM security_events WHERE id = ?', (event_id,)).fetchone()
        conn.close()
        
        log_audit(session['user_id'], 'update', 'security_events', event_id, 
                  json.dumps(dict(current_event)), json.dumps(dict(updated_event)))
    else:
        conn.close()
    
    return jsonify({'message': 'Event updated successfully'})

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@login_required
def delete_event(event_id):
    """Delete security event"""
    conn = get_db_connection()
    
    # Get current event before deletion
    current_event = conn.execute('SELECT * FROM security_events WHERE id = ?', (event_id,)).fetchone()
    if not current_event:
        conn.close()
        return jsonify({'error': 'Event not found'}), 404
    
    # Delete event
    conn.execute('DELETE FROM security_events WHERE id = ?', (event_id,))
    conn.commit()
    conn.close()
    
    log_audit(session['user_id'], 'delete', 'security_events', event_id, 
              json.dumps(dict(current_event)), None)
    
    return jsonify({'message': 'Event deleted successfully'})

@app.route('/api/audit', methods=['GET'])
@login_required
def get_audit_logs():
    """Get audit logs"""
    conn = get_db_connection()
    
    # Get query parameters
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    # Build query
    query = '''
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.timestamp DESC
        LIMIT ? OFFSET ?
    '''
    
    logs = conn.execute(query, (limit, offset)).fetchall()
    conn.close()
    
    # Format logs for frontend
    formatted_logs = []
    for log in logs:
        formatted_logs.append({
            'id': log['id'],
            'timestamp': log['timestamp'],
            'user': log['user_name'] or 'Unknown',
            'action': log['action'],
            'resource': log['table_name'],
            'details': f"{log['action']} on {log['table_name']}" + (f" (ID: {log['record_id']})" if log['record_id'] else ""),
            'ip_address': log['ip_address'] or 'N/A',
            'user_agent': log['user_agent'] or 'N/A'
        })
    
    return jsonify(formatted_logs)

@app.route('/api/rules', methods=['GET'])
@login_required
def get_rules():
    """Get rules"""
    conn = get_db_connection()
    rules = conn.execute('SELECT * FROM rules ORDER BY created_at DESC').fetchall()
    conn.close()
    
    return jsonify([dict(rule) for rule in rules])

@app.route('/api/rules', methods=['POST'])
@role_required(['soc_manager', 'admin'])
def create_rule():
    """Create new rule"""
    data = request.get_json()
    
    required_fields = ['name', 'description', 'condition_type', 'condition_value', 'action_type', 'action_value']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO rules (name, description, condition_type, condition_value, action_type, action_value, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (data['name'], data['description'], data['condition_type'], 
          json.dumps(data['condition_value']), data['action_type'], 
          json.dumps(data['action_value']), session['user_id']))
    
    conn.commit()
    conn.close()
    
    log_audit(session['user_id'], 'create', 'rules', None, None, json.dumps(data))
    
@app.route('/api/rules/<int:rule_id>', methods=['PUT'])
@role_required(['soc_manager', 'admin'])
def update_rule(rule_id):
    """Update existing rule"""
    data = request.get_json()
    
    conn = get_db_connection()
    
    # Get current rule
    current_rule = conn.execute('SELECT * FROM rules WHERE id = ?', (rule_id,)).fetchone()
    if not current_rule:
        conn.close()
        return jsonify({'error': 'Rule not found'}), 404
    
    # Update rule
    update_fields = []
    params = []
    
    for field in ['name', 'description', 'condition_type', 'condition_value', 'action_type', 'action_value', 'is_active']:
        if field in data:
            if field in ['condition_value', 'action_value']:
                update_fields.append(f"{field} = ?")
                params.append(json.dumps(data[field]))
            else:
                update_fields.append(f"{field} = ?")
                params.append(data[field])
    
    if update_fields:
        params.append(rule_id)
        conn.execute(f"UPDATE rules SET {', '.join(update_fields)} WHERE id = ?", params)
        conn.commit()
    
    conn.close()
    
    log_audit(session['user_id'], 'update', 'rules', rule_id, 
              json.dumps(dict(current_rule)), json.dumps(data))
    
    return jsonify({'message': 'Rule updated successfully'})

@app.route('/api/sources', methods=['GET'])
@login_required
def get_sources():
    """Get data sources"""
    conn = get_db_connection()
    sources = conn.execute('SELECT * FROM event_sources ORDER BY created_at DESC').fetchall()
    conn.close()
    
    return jsonify([dict(source) for source in sources])

@app.route('/api/sources', methods=['POST'])
@role_required(['soc_manager', 'admin'])
def create_source():
    """Create new data source"""
    data = request.get_json()
    
    required_fields = ['name', 'type', 'endpoint']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO event_sources (name, type, endpoint, api_key, is_active)
        VALUES (?, ?, ?, ?, ?)
    ''', (data['name'], data['type'], data['endpoint'], 
          data.get('api_key', ''), data.get('is_active', True)))
    
    conn.commit()
    conn.close()
    
    log_audit(session['user_id'], 'create', 'event_sources', None, None, json.dumps(data))
    
    return jsonify({'message': 'Source created successfully'})

@app.route('/api/sources/<int:source_id>', methods=['PUT'])
@role_required(['soc_manager', 'admin'])
def update_source(source_id):
    """Update existing data source"""
    data = request.get_json()
    
    conn = get_db_connection()
    
    # Get current source
    current_source = conn.execute('SELECT * FROM event_sources WHERE id = ?', (source_id,)).fetchone()
    if not current_source:
        conn.close()
        return jsonify({'error': 'Source not found'}), 404
    
    # Update source
    update_fields = []
    params = []
    
    for field in ['name', 'type', 'endpoint', 'api_key', 'is_active']:
        if field in data:
            update_fields.append(f"{field} = ?")
            params.append(data[field])
    
    if update_fields:
        params.append(source_id)
        conn.execute(f"UPDATE event_sources SET {', '.join(update_fields)} WHERE id = ?", params)
        conn.commit()
    
    conn.close()
    
    log_audit(session['user_id'], 'update', 'event_sources', source_id, 
              json.dumps(dict(current_source)), json.dumps(data))
    
    return jsonify({'message': 'Source updated successfully'})

@app.route('/api/stats', methods=['GET'])
@login_required
def get_stats():
    """Get dashboard statistics"""
    conn = get_db_connection()
    
    # Event counts by severity (all events, not just last 24 hours)
    severity_stats = conn.execute('''
        SELECT severity, COUNT(*) as count 
        FROM security_events 
        GROUP BY severity
    ''').fetchall()
    
    # Event counts by status
    status_stats = conn.execute('''
        SELECT status, COUNT(*) as count 
        FROM security_events 
        GROUP BY status
    ''').fetchall()
    
    # Recent events (last hour)
    recent_events = conn.execute('''
        SELECT COUNT(*) as count 
        FROM security_events 
        WHERE timestamp >= datetime('now', '-1 hour')
    ''').fetchone()
    
    conn.close()
    
    return jsonify({
        'severity_stats': [dict(stat) for stat in severity_stats],
        'status_stats': [dict(stat) for stat in status_stats],
        'recent_events': recent_events['count']
    })

@app.route('/api/lab/event', methods=['POST'])
@login_required
def create_lab_event():
    """Create event from lab simulation"""
    data = request.get_json()
    
    required_fields = ['source', 'severity', 'category', 'title', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"
    
    cursor = conn.execute('''
        INSERT INTO security_events (event_id, source, severity, category, title, description, raw_data, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (event_id, data['source'], data['severity'], data['category'], 
          data['title'], data['description'], data.get('raw_data', ''), session['user_id']))
    
    # Get the created event ID before committing
    event_db_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    log_audit(session['user_id'], 'create', 'security_events', event_db_id, None, 
              json.dumps({**data, 'source': 'lab'}))
    
    return jsonify({'message': 'Lab event created successfully', 'event_id': event_id, 'id': event_db_id})

if __name__ == '__main__':
    # Initialize database
    if not os.path.exists(app.config['DATABASE']):
        init_db()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
