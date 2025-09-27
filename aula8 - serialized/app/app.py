from flask import Flask, request, render_template, redirect, url_for, jsonify, session, flash
import pickle
import base64
import hashlib
import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = 'minimarket-secret-2024'

# Product database
products = {
    1: {'name': 'Fresh Milk', 'price': 3.99, 'category': 'Dairy', 'stock': 25, 'image': '🥛'},
    2: {'name': 'Whole Wheat Bread', 'price': 2.49, 'category': 'Bakery', 'stock': 15, 'image': '🍞'},
    3: {'name': 'Organic Apples', 'price': 4.99, 'category': 'Fruits', 'stock': 30, 'image': '🍎'},
    4: {'name': 'Ground Coffee', 'price': 8.99, 'category': 'Beverages', 'stock': 12, 'image': '☕'},
    5: {'name': 'Chicken Breast', 'price': 12.99, 'category': 'Meat', 'stock': 8, 'image': '🍗'},
    6: {'name': 'Cheddar Cheese', 'price': 5.49, 'category': 'Dairy', 'stock': 18, 'image': '🧀'},
    7: {'name': 'Fresh Bananas', 'price': 2.99, 'category': 'Fruits', 'stock': 22, 'image': '🍌'},
    8: {'name': 'Pasta Sauce', 'price': 3.29, 'category': 'Pantry', 'stock': 20, 'image': '🍝'},
    9: {'name': 'Greek Yogurt', 'price': 4.19, 'category': 'Dairy', 'stock': 16, 'image': '🥛'},
    10: {'name': 'Chocolate Cookies', 'price': 6.99, 'category': 'Snacks', 'stock': 14, 'image': '🍪'}
}

# Customer database
customers = {
    'customer1': {
        'password': hashlib.md5('password123'.encode()).hexdigest(),
        'name': 'John Customer',
        'email': 'john@email.com',
        'address': '123 Main St, City',
        'phone': '555-0123'
    },
    'customer2': {
        'password': hashlib.md5('mypass456'.encode()).hexdigest(),
        'name': 'Sarah Johnson',
        'email': 'sarah@email.com',
        'address': '456 Oak Ave, Town',
        'phone': '555-0456'
    }
}

# Order history
orders = []

class CartItem:
    def __init__(self, product_id, quantity, price):
        self.product_id = product_id
        self.quantity = quantity
        self.price = price
        self.timestamp = datetime.datetime.now()

def require_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    categories = list(set(product['category'] for product in products.values()))
    return render_template('index.html', products=products, categories=categories)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username in customers:
            password_hash = hashlib.md5(password.encode()).hexdigest()
            if customers[username]['password'] == password_hash:
                session['username'] = username
                flash('Welcome back!', 'success')
                return redirect(url_for('shop'))
        
        flash('Invalid credentials', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/shop')
@require_login
def shop():
    category_filter = request.args.get('category')
    filtered_products = products
    
    if category_filter:
        filtered_products = {k: v for k, v in products.items() 
                           if v['category'] == category_filter}
    
    categories = list(set(product['category'] for product in products.values()))
    return render_template('shop.html', products=filtered_products, 
                         categories=categories, selected_category=category_filter)

@app.route('/add_to_cart', methods=['POST'])
@require_login
def add_to_cart():
    product_id = int(request.form.get('product_id'))
    quantity = int(request.form.get('quantity', 1))
    
    if product_id in products and products[product_id]['stock'] >= quantity:
        cart_item = {
            'product_id': product_id,
            'quantity': quantity,
            'price': products[product_id]['price'],
            'name': products[product_id]['name']
        }
        
        serialized = pickle.dumps(cart_item)
        encoded = base64.b64encode(serialized).decode('utf-8')
        
        return jsonify({
            'success': True,
            'message': f'Added {products[product_id]["name"]} to cart!',
            'cart_item': encoded
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Product not available or insufficient stock'
        })

@app.route('/cart')
@require_login
def view_cart():
    return render_template('cart.html')

@app.route('/generate_cart', methods=['POST'])
@require_login
def generate_cart():
    try:
        cart_items_data = request.json.get('cart_items', [])
        
        cart_items = []
        for item_data in cart_items_data:
            try:
                decoded = base64.b64decode(item_data.encode('utf-8'))
                item = pickle.loads(decoded)
                
                cart_items.append({
                    'product_id': item['product_id'],
                    'quantity': item['quantity'],
                    'price': item['price']
                })
            except:
                continue
        
        serialized_cart = pickle.dumps(cart_items)
        encoded_cart = base64.b64encode(serialized_cart).decode('utf-8')
        
        return jsonify({
            'success': True,
            'cart_data': encoded_cart
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error generating cart'
        })

@app.route('/decode_item', methods=['POST'])
@require_login
def decode_item():
    try:
        item_data = request.json.get('item_data', '')
        
        decoded = base64.b64decode(item_data.encode('utf-8'))
        item = pickle.loads(decoded)
        
        return jsonify({
            'success': True,
            'item': {
                'name': item['name'],
                'price': item['price'],
                'quantity': item['quantity'],
                'product_id': item['product_id']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error decoding item'
        })

@app.route('/checkout', methods=['POST'])
@require_login
def checkout():
    try:
        cart_data = request.form.get('cart_data', '').strip()
        
        if not cart_data:
            flash('Cart is empty', 'error')
            return redirect(url_for('view_cart'))
        
        try: 
            decoded_cart = base64.b64decode(cart_data.encode('utf-8'))
            cart_items = pickle.loads(decoded_cart)
            
            if not isinstance(cart_items, list):
                flash('Invalid cart format', 'error')
                return redirect(url_for('view_cart'))
                
            if len(cart_items) == 0:
                flash('Cart is empty', 'error')
                return redirect(url_for('view_cart'))
                
            order_items = []
            total = 0
            
            for item in cart_items:
                try:
                    product_id = item['product_id']
                    quantity = item['quantity']
                    price = item['price']
                    
                    if product_id in products:
                        product = products[product_id]
                        products[product_id]['stock'] -= quantity
                        
                        item_total = quantity * price
                        order_items.append({
                            'product_name': product['name'],
                            'quantity': quantity,
                            'price': price,
                            'total': item_total
                        })
                        total += item_total
                except Exception as e:
                    continue
            
            if len(order_items) == 0:
                flash('No valid items in cart', 'error')
                return redirect(url_for('view_cart'))
            
            order = {
                'id': len(orders) + 1,
                'customer': session['username'],
                'items': order_items,
                'total': total,
                'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'Processing'
            }
            
            orders.append(order)
            
            flash(f'Order placed successfully! Order ID: {order["id"]}', 'success')
            return redirect(url_for('order_confirmation', order_id=order['id']))
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            flash('Invalid cart data - must be a valid serialized cart', 'error')
            
    except Exception as e:
        flash('Error processing checkout', 'error')
    
    return redirect(url_for('view_cart'))

@app.route('/order/<int:order_id>')
@require_login
def order_confirmation(order_id):
    order = next((o for o in orders if o['id'] == order_id), None)
    if not order or order['customer'] != session['username']:
        flash('Order not found', 'error')
        return redirect(url_for('shop'))
    
    return render_template('order.html', order=order)

@app.route('/orders')
@require_login
def order_history():
    user_orders = [o for o in orders if o['customer'] == session['username']]
    return render_template('orders.html', orders=user_orders)

@app.route('/clear_cart')
@require_login
def clear_cart():
    flash('Cart cleared', 'info')
    return redirect(url_for('view_cart'))

@app.route('/api/products')
def api_products():
    return jsonify(products)

@app.route('/api/product/<int:product_id>')
def api_product(product_id):
    if product_id in products:
        return jsonify(products[product_id])
    return jsonify({'error': 'Product not found'}), 404

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
