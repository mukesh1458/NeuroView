import express from 'express';
import Collection from '../models/collection.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// GET all collections for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const collections = await Collection.find({ user: req.user.id })
            .populate('posts')
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: collections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CREATE a new collection
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, isPrivate } = req.body;
        const newCollection = await Collection.create({
            name,
            user: req.user.id,
            isPrivate: isPrivate !== undefined ? isPrivate : true,
            posts: []
        });
        res.status(201).json({ success: true, data: newCollection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ADD a post to a collection
router.post('/:id/add', verifyToken, async (req, res) => {
    try {
        const { postId } = req.body;
        const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });

        if (!collection) {
            return res.status(404).json({ success: false, message: "Collection not found" });
        }

        if (collection.posts.includes(postId)) {
            return res.status(400).json({ success: false, message: "Post already in collection" });
        }

        collection.posts.push(postId);
        // Set cover photo if it's the first post and no cover exists
        // (Logic to fetch post photo would go here if we wanted to auto-set cover)

        await collection.save();
        res.status(200).json({ success: true, message: "Added to collection", data: collection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// REMOVE a post from a collection
router.post('/:id/remove', verifyToken, async (req, res) => {
    try {
        const { postId } = req.body;
        const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });

        if (!collection) {
            return res.status(404).json({ success: false, message: "Collection not found" });
        }

        collection.posts = collection.posts.filter(id => id.toString() !== postId);
        await collection.save();
        res.status(200).json({ success: true, message: "Removed from collection", data: collection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
