import express from 'express';
import User from '../models/user.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// UPDATE PROFILE
router.put('/update', verifyToken, async (req, res) => {
    try {
        const { username, bio, avatar } = req.body;
        const userId = req.user.id;

        // Check if username is taken (if changed)
        if (username) {
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({ success: false, message: 'Username is already taken' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...(username && { username }),
                ...(bio && { bio }),
                ...(avatar && { avatar })
            },
            { new: true }
        );

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
