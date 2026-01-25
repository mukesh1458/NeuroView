import mongoose from "mongoose";

const SummaryPost = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        default: 'Anonymous'
    },
    sourceUrl: {
        type: String,
        required: false
    },
    originalText: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const SummaryPostSchema = mongoose.model("SummaryPost", SummaryPost)

export default SummaryPostSchema
