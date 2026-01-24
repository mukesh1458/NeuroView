import express from "express";
import * as dotenv from 'dotenv';
import SummaryPost from '../models/summaryPost.js'

dotenv.config();

const router = express.Router();

// GET all summaries
router.get("/summary-posts", async (req, res) => {
    try {
        const posts = await SummaryPost.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fetching summaries failed, please try again' });
    }
});

// CREATE a new summary post
router.post("/summary-posts", async (req, res) => {
    try {
        const { content, sourceUrl, originalText } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required" });
        }

        const newPost = await SummaryPost.create({
            content,
            sourceUrl,
            originalText
        });

        res.status(200).json({ success: true, data: newPost });
    } catch (err) {
        console.error("Error creating summary post:", err);
        res.status(500).json({ success: false, message: 'Unable to create post, please try again' });
    }
});

export default router;
