import mongoose from "mongoose";
import { frequency } from "../frequencyEnum.js";
import { gainsCategories } from "./gainsCategories.js";

const gainTemplateSchema = new mongoose.Schema({
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

    gainFrequency: {
        type: String,
        required: true,
        enum: Object.values(frequency)
    },

    dueDate: {
        type: Number,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    }

});

export const GainTemplate = mongoose.model("GainTemplate", gainTemplateSchema);