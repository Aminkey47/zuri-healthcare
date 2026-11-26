const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// API health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Zuri Healthcare API is running!'
    });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS result');

        res.status(200).json({
            success: true,
            message: 'Database connection successful!',
            data: rows
        });

    } catch (error) {
        console.error('Database connection error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Database connection failed.'
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Zuri Healthcare API running on port ${PORT}`);
});