import mongoose from "mongoose";

const Post = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null,
    },
    colors: {
        type: [String],
        default: []
    }
});

const PostSchema = mongoose.model("Post", Post)

export default PostSchema