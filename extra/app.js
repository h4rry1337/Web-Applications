const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'techsupport-secret-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// File upload configuration
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// User database
const users = {
    'tech.support': {
        password: bcrypt.hashSync('support123', 10),
        name: 'Technical Support',
        role: 'admin',
        email: 'support@techhelp.com',
        department: 'IT Support'
    },
    'john.user': {
        password: bcrypt.hashSync('user123', 10),
        name: 'John User',
        role: 'user',
        email: 'john@company.com',
        department: 'Sales'
    },
    'sarah.admin': {
        password: bcrypt.hashSync('admin456', 10),
        name: 'Sarah Admin',
        role: 'admin',
        email: 'sarah@company.com',
        department: 'IT Management'
    }
};

// Tickets database
let tickets = [
    {
        id: 'TK-001',
        title: 'Computer Won\'t Start',
        description: 'My computer shows a blue screen when I try to turn it on.',
        category: 'Hardware',
        priority: 'High',
        status: 'Open',
        created_by: 'john.user',
        assigned_to: 'tech.support',
        created_at: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss'),
        updated_at: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        comments: [
            {
                id: uuidv4(),
                user: 'tech.support',
                message: 'Can you provide the exact error message?',
                timestamp: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
            }
        ],
        attachments: []
    },
    {
        id: 'TK-002',
        title: 'Email Not Working',
        description: 'Cannot send or receive emails since this morning.',
        category: 'Software',
        priority: 'Medium',
        status: 'In Progress',
        created_by: 'john.user',
        assigned_to: 'tech.support',
        created_at: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        updated_at: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss'),
        comments: [],
        attachments: []
    }
];

// Knowledge base articles
const knowledgeBase = [
    {
        id: 'KB-001',
        title: 'How to Reset Your Password',
        category: 'Account Management',
        content: 'Step-by-step guide to reset your account password...',
        created_at: moment().subtract(30, 'days').format('YYYY-MM-DD')
    },
    {
        id: 'KB-002',
        title: 'Common Network Issues',
        category: 'Network',
        content: 'Troubleshooting guide for network connectivity problems...',
        created_at: moment().subtract(15, 'days').format('YYYY-MM-DD')
    }
];

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied. Administrator privileges required.');
    }
}

// Routes
app.get('/', (req, res) => {
    const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'Open').length,
        inProgressTickets: tickets.filter(t => t.status === 'In Progress').length,
        resolvedTickets: tickets.filter(t => t.status === 'Resolved').length
    };
    res.render('index', { user: req.session.user, stats, moment });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username in users) {
        if (bcrypt.compareSync(password, users[username].password)) {
            req.session.user = {
                username: username,
                ...users[username]
            };
            return res.redirect('/dashboard');
        }
    }
    
    res.render('login', { error: 'Invalid credentials' });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/dashboard', requireAuth, (req, res) => {
    const userTickets = req.session.user.role === 'admin' 
        ? tickets 
        : tickets.filter(t => t.created_by === req.session.user.username || t.assigned_to === req.session.user.username);
    
    res.render('dashboard', { 
        user: req.session.user, 
        tickets: userTickets, 
        moment 
    });
});

app.get('/tickets/new', requireAuth, (req, res) => {
    res.render('new-ticket', { user: req.session.user });
});

app.post('/tickets/new', requireAuth, upload.array('attachments', 5), (req, res) => {
    const { title, description, category, priority } = req.body;
    
    const ticket = {
        id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
        title,
        description,
        category,
        priority,
        status: 'Open',
        created_by: req.session.user.username,
        assigned_to: 'tech.support',
        created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        comments: [],
        attachments: req.files ? req.files.map(file => ({
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype
        })) : []
    };
    
    tickets.push(ticket);
    res.redirect(`/tickets/${ticket.id}`);
});

app.get('/tickets/:id', requireAuth, (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    
    if (!ticket) {
        return res.status(404).send('Ticket not found');
    }
    
    // Check access permissions
    if (req.session.user.role !== 'admin' && 
        ticket.created_by !== req.session.user.username && 
        ticket.assigned_to !== req.session.user.username) {
        return res.status(403).send('Access denied');
    }
    
    res.render('ticket-detail', { 
        user: req.session.user, 
        ticket, 
        moment 
    });
});

app.post('/tickets/:id/comment', requireAuth, (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    const { message } = req.body;
    
    if (ticket) {
        ticket.comments.push({
            id: uuidv4(),
            user: req.session.user.username,
            message,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
        });
        ticket.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    
    res.redirect(`/tickets/${req.params.id}`);
});

app.post('/tickets/:id/status', requireAuth, (req, res) => {
    const ticket = tickets.find(t => t.id === req.params.id);
    const { status } = req.body;
    
    if (ticket && req.session.user.role === 'admin') {
        ticket.status = status;
        ticket.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    
    res.redirect(`/tickets/${req.params.id}`);
});

app.get('/knowledge-base', (req, res) => {
    res.render('knowledge-base', { 
        user: req.session.user, 
        articles: knowledgeBase, 
        moment 
    });
});

app.get('/reports', requireAdmin, (req, res) => {
    const reportData = {
        ticketsByCategory: {},
        ticketsByPriority: {},
        ticketsByStatus: {},
        dailyStats: []
    };
    
    // Generate report statistics
    tickets.forEach(ticket => {
        reportData.ticketsByCategory[ticket.category] = (reportData.ticketsByCategory[ticket.category] || 0) + 1;
        reportData.ticketsByPriority[ticket.priority] = (reportData.ticketsByPriority[ticket.priority] || 0) + 1;
        reportData.ticketsByStatus[ticket.status] = (reportData.ticketsByStatus[ticket.status] || 0) + 1;
    });
    
    // Generate daily stats for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const dayTickets = tickets.filter(t => t.created_at.startsWith(date));
        reportData.dailyStats.push({
            date,
            count: dayTickets.length
        });
    }
    
    res.render('reports', { 
        user: req.session.user, 
        reportData, 
        moment 
    });
});

// System logs endpoint - secure implementation
app.get('/admin/logs', requireAdmin, (req, res) => {
    const logFile = req.query.file || 'system.log';
    
    // Whitelist of allowed log files (security fix)
    const allowedLogs = ['system.log', 'error.log', 'access.log', 'debug.log'];
    
    if (!allowedLogs.includes(logFile)) {
        return res.render('logs', { 
            user: req.session.user, 
            logContent: 'Invalid log file requested', 
            logFile: 'system.log', 
            moment 
        });
    }
    
    const logPath = path.join(__dirname, 'logs', logFile);
    
    try {
        if (fs.existsSync(logPath)) {
            const logContent = fs.readFileSync(logPath, 'utf8');
            res.render('logs', { 
                user: req.session.user, 
                logContent, 
                logFile, 
                moment 
            });
        } else {
            res.render('logs', { 
                user: req.session.user, 
                logContent: 'Log file not found', 
                logFile, 
                moment 
            });
        }
    } catch (error) {
        res.render('logs', { 
            user: req.session.user, 
            logContent: 'Error reading log file', 
            logFile, 
            moment 
        });
    }
});


// API endpoints
app.get('/api/tickets', requireAuth, (req, res) => {
    const userTickets = req.session.user.role === 'admin' 
        ? tickets 
        : tickets.filter(t => t.created_by === req.session.user.username);
    
    res.json(userTickets);
});

app.get('/api/stats', requireAuth, (req, res) => {
    const stats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'Open').length,
        inProgressTickets: tickets.filter(t => t.status === 'In Progress').length,
        resolvedTickets: tickets.filter(t => t.status === 'Resolved').length,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    
    res.json(stats);
});

// Date format preview endpoint
app.get('/admin/date-preview', requireAdmin, (req, res) => {
    const locale = req.query.locale;
    
    const localeData = moment.locale(locale);
    
    const preview = {
        locale: localeData,
        formatted: moment().format('LLLL'),
        relative: moment().fromNow()
    };
    
    res.json(preview);
        
});

// Create necessary directories
const dirs = ['uploads', 'logs', 'locales'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Create sample log files
const sampleLogs = {
    'system.log': `[${moment().format('YYYY-MM-DD HH:mm:ss')}] INFO: System started successfully
[${moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}] INFO: User login: tech.support
[${moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss')}] WARN: High memory usage detected
[${moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss')}] INFO: Ticket TK-001 created`,
    
    'error.log': `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: Failed database connection attempt
[${moment().subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')}] ERROR: File upload failed for user john.user
[${moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')}] ERROR: Invalid login attempt from IP 192.168.1.100`,
    
    'access.log': `[${moment().format('YYYY-MM-DD HH:mm:ss')}] GET /dashboard - 200 - tech.support
[${moment().subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss')}] POST /tickets/new - 302 - john.user
[${moment().subtract(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')}] GET /tickets/TK-001 - 200 - tech.support`
};

Object.keys(sampleLogs).forEach(filename => {
    const logPath = path.join(__dirname, 'logs', filename);
    if (!fs.existsSync(logPath)) {
        fs.writeFileSync(logPath, sampleLogs[filename]);
    }
});

app.listen(PORT, () => {
    console.log('========================================');
    console.log('TechSupport Ticket System');
    console.log('========================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Access: http://localhost:${PORT}`);
    console.log('========================================');
});
