import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    isPrivate: {
        type: Boolean,
        default: true
    },
    coverPhoto: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Collection = mongoose.model('Collection', CollectionSchema);

export default Collection;
