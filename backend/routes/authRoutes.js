const express = require('express');
const router = express.Router();

const {
    registerPatient,
    loginUser
} = require('../controllers/authController');

const {
    authenticateToken
} = require('../middleware/authMiddleware');

// Register
router.post('/register', registerPatient);

// Login
router.post('/login', loginUser);

// Protected user profile
router.get('/me', authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

module.exports = router;
