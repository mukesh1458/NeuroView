import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ success: false, message: "Email already registered" });

        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ success: false, message: "Username already taken" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        // Send Welcome Email
        sendWelcomeEmail(email, username);

        const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ success: true, user: { id: newUser._id, username: newUser.username, email: newUser.email }, token });
    } catch (error) {
        console.error("Registration Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Username or Email already exists" });
        }
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;
