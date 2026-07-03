import mongoose from "mongoose";
import { investmentsCategories } from "./investmentsCategories.js";
import { frequency } from "../frequencyEnum.js";

const investmentTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    investmentCategory: {
        type: String,
        required: true,
        enum: Object.values(investmentsCategories)
    },

    investmentFrequency: {
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
    },

    finishDate: {
        type: Date,
        required: true
    }
});

export const InvestmentTemplate = mongoose.model("InvestmentTemplate", investmentTemplateSchema);