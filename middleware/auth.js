const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}

function isAdmin(req, res, next) {
    if (req.userRole === 'admin') next();
    else res.status(403).json({ message: 'Requires Admin role' });
}

function isFacultyOrAdmin(req, res, next) {
    if (req.userRole === 'faculty' || req.userRole === 'admin') next();
    else res.status(403).json({ message: 'Requires Faculty or Admin role' });
}

module.exports = { verifyToken, isAdmin, isFacultyOrAdmin };
