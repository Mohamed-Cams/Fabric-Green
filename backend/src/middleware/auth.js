// Emplacement: backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const logger = require('../utils/logger');

/**
 * JWT Authentication middleware
 */
function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload;
            next();
        } catch (err) {
            logger.warn(`Invalid token: ${err.message}`);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    } catch (error) {
        logger.error(`Auth middleware error: ${error.message}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Generate JWT token
 */
function generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = { auth, generateToken };
