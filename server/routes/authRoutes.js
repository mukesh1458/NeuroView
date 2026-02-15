import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { sendWelcomeEmail } from '../services/emailService.js';

import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// GOOGLE AUTH
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        // 1. Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // 2. Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - check if they use Google Auth
            if (!user.googleId) {
                // Link Google Account to existing email account (Optional: or block)
                user.googleId = googleId;
                user.authProvider = 'google'; // Or keep 'local' but add googleId
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
        } else {
            // 3. Create new user
            // Generate a random password for security (user won't know it, allows fallback if they reset)
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Handle username conflicts logic could be added here (e.g. append numbers)
            let username = name.replace(/\s+/g, '').toLowerCase();
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                username += Math.floor(Math.random() * 1000);
            }

            user = await User.create({
                username,
                email,
                password: hashedPassword,
                avatar: picture,
                googleId,
                authProvider: 'google',
            });

            // Send Welcome Email
            sendWelcomeEmail(email, username);
        }

        // 4. Generate App JWT
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar }, token });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ success: false, message: "Google Auth Failed" });
    }
});

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

        res.status(201).json({ success: true, user: { id: newUser._id, username: newUser.username, email: newUser.email, avatar: newUser.avatar, bio: newUser.bio }, token });
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

        res.status(200).json({ success: true, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio }, token });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;
