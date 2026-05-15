const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.use(cors());
app.use(express.json());

// Serve static assets from the 'public' directory
// This means /css/style.css will map to public/css/style.css
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ message: 'No token provided' });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).send({ message: 'Unauthorized' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// Auth Routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) return res.status(404).send({ message: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: 86400 });
        res.status(200).send({ id: user.id, username: user.username, role: user.role, token });
    });
});

// Student Routes
app.get('/api/students', verifyToken, (req, res) => {
    db.all(`SELECT * FROM students`, [], (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

app.post('/api/students', verifyToken, (req, res) => {
    const { first_name, last_name, email, phone } = req.body;
    db.run(`INSERT INTO students (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)`,
        [first_name, last_name, email, phone],
        function(err) {
            if (err) return res.status(500).send(err);
            res.json({ id: this.lastID });
        }
    );
});

// Dashboard Stats
app.get('/api/stats', verifyToken, (req, res) => {
    const stats = {};
    db.get('SELECT COUNT(*) as count FROM students', (err, row) => {
        stats.students = row.count;
        db.get('SELECT COUNT(*) as count FROM faculty', (err, row) => {
            stats.faculty = row.count;
            db.get('SELECT COUNT(*) as count FROM marks', (err, row) => {
                stats.marks = row.count;
                res.json(stats);
            });
        });
    });
});

// Catch-all to serve index.html (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
