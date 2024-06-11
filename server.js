const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

let users = {};

// Load users from users.json
const loadUsers = () => {
    try {
        const data = fs.readFileSync('users.json', 'utf8');
        users = JSON.parse(data);
    } catch (err) {
        console.error('Error reading users.json:', err);
    }
};

const saveUsers = () => {
    try {
        fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error writing to users.json:', err);
    }
};

loadUsers();

app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: set to true if using HTTPS
}));

// Middleware to protect routes and redirect to login if not authenticated
const auth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        bcrypt.compare(password, users[username], (err, result) => {
            if (result) {
                req.session.user = username;
                res.redirect('/');
            } else {
                res.redirect('/login?error=Invalid%20credentials');
            }
        });
    } else {
        res.redirect('/login?error=Invalid%20credentials');
    }
});

// Serve create account page
app.get('/create-account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-account.html'));
});

// Handle create account form submission
app.post('/create-account', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        res.redirect('/create-account?error=User%20already%20exists');
    } else {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.redirect('/create-account?error=Error%20creating%20user');
            }
            users[username] = hash;
            saveUsers();
            res.redirect('/login?success=Account%20created%20successfully');
        });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Redirect root to login if not authenticated
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'system-status.html'));
    } else {
        res.redirect('/login');
    }
});

// Serve the main page with authentication
app.get('/system-status.html', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'system-status.html'));
});

// Protected routes
app.post('/shutdown', auth, (req, res) => {
    exec('shutdown -s -t 0', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error shutting down');
        }
        res.send('Shutting down...');
    });
});

app.post('/sleep', auth, (req, res) => {
    exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error sleeping');
        }
        res.send('Sleeping...');
    });
});

// Fetch system information
app.get('/system-info', auth, (req, res) => {
    try {
        const systemInfo = {
            hostname: os.hostname(),
            platform: os.platform(),
            release: os.release(),
            uptime: os.uptime(),
            totalmem: os.totalmem(),
            freemem: os.freemem(),
        };
        console.log('Sending system info:', systemInfo); // Log the response
        res.json(systemInfo);
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({ error: 'Failed to fetch system information' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://<your-computer-ip>:${port}/`);
});
