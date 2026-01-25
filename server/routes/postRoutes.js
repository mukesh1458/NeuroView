import express from "express";
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Post from '../models/post.js'

dotenv.config();

const router = express.Router();

cloudinary.config({
    //!    ########   Configuring the Cloudinary to Upload MEDIA ########
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

router.get("/post", async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Fetching posts failed, please try again' });
    }
});

import verifyToken from '../middleware/auth.js';

// ... (imports)

// Protected Route: Verify Token logic inside or as middleware
// Note: verifyToken middleware adds req.user if valid. To support both guests and users, we can make it optional or strict.
// Given the requirement "Users have their own Profile Page", let's attach user if present.
// For now, let's keep it simple: If header exists, verify it.

router.post("/post", verifyToken, async (req, res) => {
    try {
        const { name, prompt, model, parentId, colors } = req.body;
        console.log("Creating Post:", { name, prompt, model, parentId });

        const photo = req.files.photoFile;
        const photoURL = await cloudinary.uploader.upload(photo.tempFilePath, { folder: process.env.FOLDER_NAME, resource_type: "auto" });

        const newPost = await Post.create({
            name,
            prompt,
            model,
            photo: photoURL.url,
            user: req.user ? req.user.id : null, // Attached from verifyToken
            parentId: parentId || null,
            colors: colors ? JSON.parse(colors) : [] // FormData sends arrays as strings
        });

        return res.status(200).json({ success: true, data: newPost });

    } catch (error) {
        console.log("Error in /post", error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

export default router;