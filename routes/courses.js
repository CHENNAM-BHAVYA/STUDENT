const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, (req, res) => {
    db.all(`SELECT * FROM courses`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/', [verifyToken, isAdmin], (req, res) => {
    const { course_name, duration, fees } = req.body;
    db.run(`INSERT INTO courses (course_name, duration, fees) VALUES (?, ?, ?)`, [course_name, duration, fees], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ id: this.lastID, message: 'Course added successfully' });
    });
});

module.exports = router;
