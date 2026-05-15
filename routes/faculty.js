const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, (req, res) => {
    db.all(`SELECT * FROM faculty`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/', [verifyToken, isAdmin], (req, res) => {
    const { faculty_name, department, email, phone } = req.body;
    db.run(`INSERT INTO faculty (faculty_name, department, email, phone) VALUES (?, ?, ?, ?)`, [faculty_name, department, email, phone], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ id: this.lastID, message: 'Faculty added successfully' });
    });
});

module.exports = router;
