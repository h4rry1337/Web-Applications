from flask import Flask, request, render_template, redirect, url_for, jsonify, session
import jwt
import datetime
import hashlib
import os
from functools import wraps

app = Flask(__name__)

# Secret key from environment variable
app.secret_key = os.getenv('JWT_SECRET')

# Sample user database
users_db = {
    'john.smith': {
        'password': hashlib.md5('password123'.encode()).hexdigest(),
        'account_number': '1001234567',
        'balance': 15847.32,
        'full_name': 'John Smith',
        'user_type': 'customer',
        'account_type': 'Checking'
    },
    'mary.jones': {
        'password': hashlib.md5('mypass456'.encode()).hexdigest(),
        'account_number': '1001234568',
        'balance': 89234.75,
        'full_name': 'Mary Jones',
        'user_type': 'customer',
        'account_type': 'Savings'
    }
}

# Transaction history
transactions = {
    '1001234567': [
        {'date': '2024-07-01', 'description': 'Direct Deposit - Salary', 'amount': 3500.00, 'type': 'credit'},
        {'date': '2024-07-02', 'description': 'Online Purchase - Amazon', 'amount': -89.99, 'type': 'debit'},
        {'date': '2024-07-03', 'description': 'ATM Withdrawal', 'amount': -200.00, 'type': 'debit'},
        {'date': '2024-07-05', 'description': 'Utility Payment', 'amount': -156.84, 'type': 'debit'}
    ],
    '1001234568': [
        {'date': '2024-07-01', 'description': 'Transfer from Checking', 'amount': 5000.00, 'type': 'credit'},
        {'date': '2024-07-04', 'description': 'Interest Payment', 'amount': 12.34, 'type': 'credit'},
        {'date': '2024-07-06', 'description': 'Investment Purchase', 'amount': -1500.00, 'type': 'debit'}
    ]
}

def create_token(username):
    user_data = users_db[username]
    payload = {
        'username': username,
        'full_name': user_data['full_name'],
        'account_number': user_data['account_number'],
        'account_type': user_data['account_type'],
        'balance': user_data['balance'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2),
        'iat': datetime.datetime.utcnow(),
        'user_type': user_data['user_type'] 
    }
    
    return jwt.encode(payload, app.secret_key, algorithm='HS256').decode('utf-8')  

def verify_token(token):
    try:
        payload = jwt.decode(token, verify=False)
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        # Catch any unexpected errors during token verification
        return None

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First, try to get token from Authorization header (for API calls)
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]  # Remove 'Bearer ' prefix
            payload = verify_token(token)
            if payload:
                request.current_user = payload['username']
                request.user_data = payload
                return f(*args, **kwargs)
            # If API token is invalid, return JSON error
            if request.is_json:
                return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Fallback to session-stored JWT (for web interface)
        session_token = session.get('jwt_token')
        if not session_token:
            return redirect(url_for('login'))
        
        payload = verify_token(session_token)
        if not payload:
            session.clear()  # Clear invalid session
            return redirect(url_for('login'))
        
        request.current_user = payload['username']
        request.user_data = payload 
        return f(*args, **kwargs)
    return decorated_function

# Alternative decorator for API-only routes
def require_api_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing Authorization header. Format: Bearer <token>'}), 401
        
        token = auth_header[7:]
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.current_user = payload['username']
        request.user_data = payload 
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username in users_db:
            password_hash = hashlib.md5(password.encode()).hexdigest()
            if users_db[username]['password'] == password_hash:
                token = create_token(username)
                
                # For API clients (JSON requests)
                if request.headers.get('Content-Type') == 'application/json' or request.is_json:
                    return jsonify({
                        'token': token,
                        'user': {
                            'username': username,
                            'full_name': users_db[username]['full_name'],
                            'account_type': users_db[username]['account_type']
                        }
                    })
                
                # For web clients, store JWT in Flask session
                session['jwt_token'] = token
                session['username'] = username
                return redirect(url_for('dashboard'))
        
        error_msg = 'Invalid credentials'
        if request.is_json:
            return jsonify({'error': error_msg}), 401
        return render_template('login.html', error=error_msg)
    
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'JSON data required'}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    if username in users_db:
        password_hash = hashlib.md5(password.encode()).hexdigest()
        if users_db[username]['password'] == password_hash:
            token = create_token(username)
            return jsonify({
                'token': token,
                'user': {
                    'username': username,
                    'full_name': users_db[username]['full_name'],
                    'account_type': users_db[username]['account_type'],
                    'account_number': users_db[username]['account_number']
                },
                'expires_in': 7200  # 2 hours in seconds
            })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/verify-token', methods=['GET'])
@require_api_auth
def verify_token_endpoint():
    user_data = request.user_data
    
    return jsonify({
        'valid': True,
        'username': user_data['username'],
        'account_type': user_data['account_type'],
        'full_name': user_data['full_name']
    })

@app.route('/dashboard')
@require_auth
def dashboard():
    user_data = request.user_data
    recent_transactions = transactions.get(user_data['account_number'], [])[:5]
    
    # Get JWT from session for display
    jwt_token = session.get('jwt_token')
    
    return render_template('dashboard.html', 
                         user=user_data, 
                         transactions=recent_transactions,
                         jwt_token=jwt_token)

@app.route('/balance')
@require_auth
def balance():
    user_data = request.user_data
    
    return render_template('balance.html', user=user_data)

@app.route('/transactions')
@require_auth
def transaction_history():
    user_data = request.user_data
    user_transactions = transactions.get(user_data['account_number'], [])
    
    return render_template('transactions.html', 
                         user=user_data, 
                         transactions=user_transactions)

@app.route('/api/balance')
@require_api_auth
def api_balance():
    user_data = request.user_data
    
    return jsonify({
        'account_number': user_data['account_number'],
        'balance': user_data['balance'],
        'account_type': user_data['account_type'],
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/user-info')
@require_api_auth
def api_user_info():
    user_data = request.user_data
    
    return jsonify({
        'username': user_data['username'],
        'full_name': user_data['full_name'],
        'account_number': user_data['account_number'],
        'account_type': user_data['account_type'],
        'balance': user_data['balance']
    })

@app.route('/api/admin/all-users')
@require_api_auth
def api_admin_users():
    user_data = request.user_data
    
    # Only admin users can access this endpoint
    if user_data['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Return all user information for admin
    all_users = []
    for user, data in users_db.items():
        all_users.append({
            'username': user,
            'flag': 'hackingclub{fdf6fea15b18d844a3fef89faa5336fe}',
            'full_name': data['full_name'],
            'account_number': data['account_number'],
            'balance': data['balance'],
            'account_type': data['account_type']
        })
    
    return jsonify({'users': all_users})

@app.route('/logout')
def logout():
    session.clear()
    if request.is_json:
        return jsonify({'message': 'Logout successful'})
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
