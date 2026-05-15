const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all students
router.get('/', verifyToken, (req, res) => {
    db.all(`SELECT * FROM students`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows);
    });
});

// Add student
router.post('/', [verifyToken, isAdmin], (req, res) => {
    const { first_name, last_name, gender, dob, email, phone, address, course_id } = req.body;
    const query = `INSERT INTO students (first_name, last_name, gender, dob, email, phone, address, course_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [first_name, last_name, gender, dob, email, phone, address, course_id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ id: this.lastID, message: 'Student added successfully' });
    });
});

// Update student
router.put('/:id', [verifyToken, isAdmin], (req, res) => {
    const { first_name, last_name, gender, dob, email, phone, address, course_id } = req.body;
    const query = `UPDATE students SET first_name = ?, last_name = ?, gender = ?, dob = ?, email = ?, phone = ?, address = ?, course_id = ? WHERE student_id = ?`;
    db.run(query, [first_name, last_name, gender, dob, email, phone, address, course_id, req.params.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Student updated successfully' });
    });
});

// Delete student
router.delete('/:id', [verifyToken, isAdmin], (req, res) => {
    db.run(`DELETE FROM students WHERE student_id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: 'Student deleted successfully' });
    });
});

module.exports = router;
