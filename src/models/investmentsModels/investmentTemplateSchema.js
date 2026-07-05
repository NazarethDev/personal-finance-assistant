import mongoose from "mongoose";
import { investmentsCategories } from "./investmentsCategories.js";
import { frequency, weeklyFrequency, monthlyFrequency } from "../frequencyEnum.js";


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
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

investmentTemplateSchema.virtual('dueDateDescription').get(function () {
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


export const InvestmentTemplate = mongoose.model("InvestmentTemplate", investmentTemplateSchema);