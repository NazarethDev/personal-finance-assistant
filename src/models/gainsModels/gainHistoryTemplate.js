import mongoose from "mongoose";
import { gainsCategories } from "./gainsCategories.js";

const gainHistorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    gainCategory: {
        type: String,
        required: true,
        enum: Object.values(gainsCategories)
    },

    dueDate: {
        type: Date,
        required: true
    },

    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GainTemplate',
        default: null
    }
});

export const GainHistory = mongoose.model("GainHistory", gainHistorySchema)