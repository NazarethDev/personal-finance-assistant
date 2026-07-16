import mongoose from "mongoose";
import { expenseCategory } from "./expensesCategories.js";
import { frequency, weeklyFrequency, monthlyFrequency } from "../frequencyEnum.js";
import { isoDateToBrazilianDate } from "../../utils/normalizeDate.js";


const expenseTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    expenseCategory: {
        type: String,
        required: true,
        enum: Object.values(expenseCategory)
    },
    expenseFrequency: {
        type: String,
        required: true,
        enum: [...Object.keys(frequency), ...Object.values(frequency)]
    },

    dueDate: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    startDate: { type: Date, required: true },
    finishDate: { type: Date }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

expenseTemplateSchema.virtual('dueDateDescription').get(function () {
    const freq = this.expenseFrequency;

    if (freq === frequency.WEEKLY || freq === 'WEEKLY') {
        return `Toda(o) ${weeklyFrequency[this.dueDate] || 'dia inválido'}`;
    }

    if (freq === frequency.MONTHLY || freq === 'MONTHLY') {
        return `Todo dia ${this.dueDate}`;
    }

    if (freq === frequency.YEARLY || freq === 'YEARLY') {
        if (this.dueDate && this.dueDate.day && this.dueDate.month) {
            const nomeMes = monthlyFrequency[this.dueDate.month];
            return `Todo dia ${this.dueDate.day} de ${nomeMes}`;
        }
    }

    return String(this.dueDate);
});

expenseTemplateSchema.virtual('startDateFormatted').get(function () {
    return isoDateToBrazilianDate(this.startDate);
});

expenseTemplateSchema.virtual('finishDateFormatted').get(function () {
    if (!this.finishDate) return null;
    return isoDateToBrazilianDate(this.finishDate);
});

export const ExpenseTemplate = mongoose.model("ExpenseTemplate", expenseTemplateSchema);