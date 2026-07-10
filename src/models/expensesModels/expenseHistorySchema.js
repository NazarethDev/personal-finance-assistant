import mongoose from "mongoose";
import { expenseCategory } from "./expensesCategories.js";

import { isoDateToBrazilianDate } from "../../utils/normalizeDate.js";

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
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

expenseHistorySchema.virtual('dueDateFormatted').get(function () {
    if (!this.dueDate) return null;

    return isoDateToBrazilianDate(this.dueDate);
})

export const ExpenseHistory = mongoose.model("ExpenseHistory", expenseHistorySchema);