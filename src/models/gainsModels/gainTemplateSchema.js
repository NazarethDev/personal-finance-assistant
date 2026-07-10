import mongoose from "mongoose";
import { frequency, weeklyFrequency, monthlyFrequency } from "../frequencyEnum.js";
import { gainsCategories } from "./gainsCategories.js";
import { isoDateToBrazilianDate } from "../../utils/normalizeDate.js";

const gainTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    gainCategory: {
        type: String,
        required: true,
        enum: Object.values(gainsCategories)
    },
    gainFrequency: {
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

gainTemplateSchema.virtual('dueDateDescription').get(function () {
    const freq = this.gainFrequency;

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

gainTemplateSchema.virtual('startDateFormatted').get(function () {
    return isoDateToBrazilianDate(this.startDate);
});

gainTemplateSchema.virtual('finishDateFormatted').get(function () {
    if (!this.finishDate) return null;
    return isoDateToBrazilianDate(this.finishDate);
});

export const GainTemplate = mongoose.model("GainTemplate", gainTemplateSchema);