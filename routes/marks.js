const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, isFacultyOrAdmin } = require('../middleware/auth');

router.get('/:studentId', verifyToken, (req, res) => {
    db.all(`SELECT * FROM marks WHERE student_id = ?`, [req.params.studentId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/', [verifyToken, isFacultyOrAdmin], (req, res) => {
    const { student_id, subject_name, marks, semester } = req.body;
    db.run(`INSERT INTO marks (student_id, subject_name, marks, semester) VALUES (?, ?, ?, ?)`, [student_id, subject_name, marks, semester], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ id: this.lastID, message: 'Marks added successfully' });
    });
});

module.exports = router;
