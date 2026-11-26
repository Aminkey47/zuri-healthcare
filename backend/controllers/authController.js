const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new patient
const registerPatient = async (req, res) => {
    const {
        full_name, email, password, date_of_birth,
        gender, phone, address, emergency_contact, emergency_phone
    } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email and password are required.'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least 8 characters.'
        });
    }

    let connection;
    let transactionStarted = false;

    try {
        connection = await db.getConnection();

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUsers] = await connection.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await connection.beginTransaction();
        transactionStarted = true;

        const [userResult] = await connection.execute(
            `INSERT INTO users (full_name, email, password, role)
             VALUES (?, ?, ?, 'patient')`,
            [full_name.trim(), normalizedEmail, hashedPassword]
        );

        await connection.execute(
            `INSERT INTO patients
             (user_id, date_of_birth, gender, phone, address,
              emergency_contact, emergency_phone)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userResult.insertId,
                date_of_birth || null,
                gender || null,
                phone || null,
                address || null,
                emergency_contact || null,
                emergency_phone || null
            ]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: 'Patient registered successfully.'
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error('Registration error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });

    } finally {
        if (connection) connection.release();
    }
};

// Log in an existing user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.'
        });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await db.execute(
            `SELECT user_id, full_name, email, password, role
             FROM users WHERE email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// Export both functions
module.exports = { registerPatient, loginUser };
