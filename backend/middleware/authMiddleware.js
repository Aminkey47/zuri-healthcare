const jwt = require('jsonwebtoken');

// Verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Please log in to access this resource.'
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();

    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Check user role
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission.'
            });
        }

        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };
