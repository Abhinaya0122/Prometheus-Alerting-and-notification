// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Access denied');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        console.log("Decoded User:", user); // Log decoded token content
        req.user = user; // Store user info for future use
        next();
    });
};


const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    next();
};

module.exports = { verifyToken, isAdmin };
