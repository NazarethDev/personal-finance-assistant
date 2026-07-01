import mongoose from "mongoose";
import { expenseCategory } from "./expensesCategories.js";

const expenseHistorySchema = new mongoose.Schema({
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

    dueDate: {
        type: Date,
        required: true
    },

    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpenseTemplate',
        default: null
    }

});

export const ExpenseHistory = mongoose.model("ExpenseHistory", expenseHistorySchema);