const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, isFacultyOrAdmin } = require('../middleware/auth');

router.get('/:studentId', verifyToken, (req, res) => {
    db.all(`SELECT * FROM attendance WHERE student_id = ?`, [req.params.studentId], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

router.post('/', [verifyToken, isFacultyOrAdmin], (req, res) => {
    const { student_id, attendance_date, status } = req.body;
    db.run(`INSERT INTO attendance (student_id, attendance_date, status) VALUES (?, ?, ?)`, [student_id, attendance_date, status], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ id: this.lastID, message: 'Attendance marked successfully' });
    });
});

module.exports = router;
