const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

app.use(cors());
app.use(express.json());

// MongoDB Connection (optional)
let isMongoConnected = false;
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Auth Service: Connected to MongoDB');
        isMongoConnected = true;
    })
    .catch(err => {
        console.warn('Auth Service: MongoDB not available, using in-memory storage');
        console.warn('Error:', err.message);
        // Continue without MongoDB - service will work with in-memory fallback
    });

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// In-memory fallback storage
const inMemoryUsers = [];

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Use MongoDB if connected, otherwise in-memory
        if (mongoose.connection.readyState === 1) {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                email,
                password: hashedPassword
            });

            await user.save();
        } else {
            // In-memory fallback
            const existingUser = inMemoryUsers.find(u => u.email === email);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            inMemoryUsers.push({
                email,
                password: hashedPassword,
                createdAt: new Date()
            });
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        let user;
        if (mongoose.connection.readyState === 1) {
            user = await User.findOne({ email });
        } else {
            // In-memory fallback
            user = inMemoryUsers.find(u => u.email === email);
        }

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userId = user._id || email;
        const token = jwt.sign({ email: user.email, userId }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, email: user.email });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service', dbState: mongoose.connection.readyState });
});

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
