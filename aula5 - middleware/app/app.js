const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database(':memory:');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'library-secret-key-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Initialize database
function initDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Books table
        db.run(`CREATE TABLE books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            isbn TEXT UNIQUE,
            category TEXT,
            total_copies INTEGER,
            available_copies INTEGER,
            publication_year INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Loans table
        db.run(`CREATE TABLE loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            book_id INTEGER,
            loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            due_date DATETIME,
            return_date DATETIME,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (book_id) REFERENCES books (id)
        )`);

        const userPassword = bcrypt.hashSync('user123', 10);
        
        db.run(`INSERT INTO users (username, password, email, role) VALUES 
            ('james_bishop', ?, 'james@library.com', 'user'),
            ('librarian', ?, 'librarian@library.com', 'user'),
            ('john_doe', ?, 'john@example.com', 'user'),
            ('jane_smith', ?, 'jane@example.com', 'user')`,
            [userPassword, userPassword, userPassword, userPassword]);

        db.run(`INSERT INTO books (title, author, isbn, category, total_copies, available_copies, publication_year) VALUES 
            ('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', 5, 3, 1925),
            ('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', 4, 2, 1960),
            ('1984', 'George Orwell', '978-0-452-28423-4', 'Dystopian', 6, 4, 1949),
            ('Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'Romance', 3, 1, 1813),
            ('The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 'Fiction', 4, 4, 1951),
            ('Brave New World', 'Aldous Huxley', '978-0-06-085052-4', 'Science Fiction', 5, 2, 1932),
            ('The Lord of the Rings', 'J.R.R. Tolkien', '978-0-544-00341-5', 'Fantasy', 7, 5, 1954),
            ('Harry Potter and the Sorcerer Stone', 'J.K. Rowling', '978-0-439-70818-8', 'Fantasy', 8, 6, 1997)`);

        db.run(`INSERT INTO loans (user_id, book_id, due_date, status) VALUES 
            (3, 1, datetime('now', '+14 days'), 'active'),
            (4, 2, datetime('now', '+7 days'), 'active'),
            (3, 3, datetime('now', '-2 days'), 'overdue'),
            (4, 4, datetime('now', '+10 days'), 'active')`);
    });
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Admin middleware
function requireAdmin(req, res, next) {
    if (req.headers['x-admin'] == 'true') next();
    else if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied. Administrator privileges required.');
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.render('login', { error: 'Database error' });
        }
        
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/dashboard', requireAuth, (req, res) => {
    const query = `
        SELECT b.title, b.author, l.loan_date, l.due_date, l.status 
        FROM loans l 
        JOIN books b ON l.book_id = b.id 
        WHERE l.user_id = ? AND l.status IN ('active', 'overdue')
    `;
    
    db.all(query, [req.session.user.id], (err, loans) => {
        if (err) {
            return res.render('dashboard', { user: req.session.user, loans: [], error: 'Database error' });
        }
        res.render('dashboard', { user: req.session.user, loans, error: null });
    });
});

app.get('/books', requireAuth, (req, res) => {
    db.all('SELECT * FROM books WHERE available_copies > 0', (err, books) => {
        if (err) {
            return res.render('books', { user: req.session.user, books: [], error: 'Database error' });
        }
        res.render('books', { user: req.session.user, books, error: null });
    });
});

app.post('/borrow', requireAuth, (req, res) => {
    const { bookId } = req.body;
    const userId = req.session.user.id;
    
    db.get('SELECT * FROM books WHERE id = ? AND available_copies > 0', [bookId], (err, book) => {
        if (err || !book) {
            return res.json({ success: false, message: 'Book not available' });
        }
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        
        db.run('INSERT INTO loans (user_id, book_id, due_date) VALUES (?, ?, ?)', 
            [userId, bookId, dueDate.toISOString()], function(err) {
            if (err) {
                return res.json({ success: false, message: 'Loan creation failed' });
            }
            
            db.run('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [bookId], (err) => {
                if (err) {
                    return res.json({ success: false, message: 'Update failed' });
                }
                res.json({ success: true, message: 'Book borrowed successfully' });
            });
        });
    });
});

app.get('/admin', requireAdmin, (req, res) => {
    const queries = {
        totalBooks: 'SELECT COUNT(*) as count FROM books',
        totalUsers: 'SELECT COUNT(*) as count FROM users WHERE role != "admin"',
        activeLoans: 'SELECT COUNT(*) as count FROM loans WHERE status = "active"',
        overdueLoans: 'SELECT COUNT(*) as count FROM loans WHERE status = "overdue" OR (status = "active" AND due_date < datetime("now"))'
    };
    
    const stats = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.get(queries[key], (err, result) => {
            if (!err) stats[key] = result.count;
            completed++;
            if (completed === Object.keys(queries).length) {
                res.render('admin', { user: req.session.user, stats });
            }
        });
    });
});

app.get('/admin/users', requireAdmin, (req, res) => {
    db.all('SELECT id, username, email, role, created_at FROM users', (err, users) => {
        if (err) {
            return res.render('admin-users', { user: req.session.user, users: [], error: 'Database error' });
        }
        res.render('admin-users', { user: req.session.user, users, error: null });
    });
});

app.get('/admin/books', requireAdmin, (req, res) => {
    db.all('SELECT * FROM books ORDER BY title', (err, books) => {
        if (err) {
            return res.render('admin-books', { user: req.session.user, books: [], error: 'Database error' });
        }
        res.render('admin-books', { user: req.session.user, books, error: null });
    });
});

app.get('/admin/loans', requireAdmin, (req, res) => {
    const query = `
        SELECT l.*, u.username, b.title, b.author 
        FROM loans l 
        JOIN users u ON l.user_id = u.id 
        JOIN books b ON l.book_id = b.id 
        ORDER BY l.loan_date DESC
    `;
    
    db.all(query, (err, loans) => {
        if (err) {
            return res.render('admin-loans', { user: req.session.user, loans: [], error: 'Database error' });
        }
        res.render('admin-loans', { user: req.session.user, loans, error: null });
    });
});

app.post('/admin/add-book', requireAdmin, (req, res) => {
    const { title, author, isbn, category, total_copies, publication_year } = req.body;
    
    db.run(`INSERT INTO books (title, author, isbn, category, total_copies, available_copies, publication_year) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [title, author, isbn, category, total_copies, total_copies, publication_year], 
        function(err) {
            if (err) {
                return res.json({ success: false, message: 'Failed to add book' });
            }
            res.json({ success: true, message: 'Book added successfully' });
        });
});

app.delete('/admin/user/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;
    
    db.run('DELETE FROM users WHERE id = ? AND role != "admin"', [userId], function(err) {
        if (err) {
            return res.json({ success: false, message: 'Failed to delete user' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    });
});

// API endpoint for system information
app.get('/api/system-info', requireAdmin, (req, res) => {
    const systemInfo = {
        version: '1.0.0',
        database: 'SQLite3 (in-memory)',
        session_secret: 'library-secret-key-2024',
        flag: 'hackingclub{7f94738c964596b288b3b84eb5453c81}',
        admin_users: [],
        server_time: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };
    
    db.all('SELECT username, email, role FROM users WHERE role = "admin"', (err, admins) => {
        if (!err) systemInfo.admin_users = admins;
        res.json(systemInfo);
    });
});

// Initialize database and start server
initDatabase();

app.listen(PORT, () => {
    console.log('========================================');
    console.log('📚 Library Management System');
    console.log('========================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Access: http://localhost:${PORT}`);
});
