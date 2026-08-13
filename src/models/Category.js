import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['expense', 'gain', 'investment']
    }
}, { timestamps: true });

categorySchema.index({ name: 1, type: 1 }, { unique: true });

export const Category = mongoose.model('Category', categorySchema);