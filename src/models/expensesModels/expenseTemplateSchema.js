import mongoose from "mongoose";
import { expenseCategory } from "./expensesCategories.js";
import { frequency } from "../frequencyEnum.js";

const expenseTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    expenseCategory: {
        type: String,
        required: true,
        enum: Object.values(expenseCategory)
    },

    expenseFrequency: {
        type: String,
        required: true,
        enum: Object.values(frequency)
    },

    dateOfOccurance: {
        type: Number,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    }

});

export const ExpenseTemplate = mongoose.model("ExpenseTemplate", expenseTemplateSchema);