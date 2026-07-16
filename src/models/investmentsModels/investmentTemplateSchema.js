import mongoose from "mongoose";
import { investmentsCategories } from "./investmentsCategories.js";
import { frequency, weeklyFrequency, monthlyFrequency } from "../frequencyEnum.js";

import { isoDateToBrazilianDate } from "../../utils/normalizeDate.js";

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
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    finishDate: {
        type: Date,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

investmentTemplateSchema.virtual('dueDateDescription').get(function () {
    const freq = this.investmentFrequency;

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

    return isoDateToBrazilianDate(this.dueDate);
});

investmentTemplateSchema.virtual('startDateFormatted').get(function () {
    return isoDateToBrazilianDate(this.startDate);
});

investmentTemplateSchema.virtual('finishDateFormatted').get(function () {
    if (!this.finishDate) return null;
    return isoDateToBrazilianDate(this.finishDate);
});

export const InvestmentTemplate = mongoose.model("InvestmentTemplate", investmentTemplateSchema);