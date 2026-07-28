import mongoose from "mongoose";
import { investmentsCategories } from "./investmentsCategories.js";
import { frequency, weeklyFrequency, monthlyFrequency } from "../frequencyEnum.js";

import { isoDateToBrazilianDate } from "../../utils/normalizeDate.js";

const investmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true,
        enum: Object.values(investmentsCategories)
    },

    frequency: {
        type: String,
        required: true,
        enum: Object.values(frequency)
    },
    seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    dueDate: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    finishDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

investmentSchema.virtual('dueDateDescription').get(function () {
    const freq = this.expenseFrequency;

    if (freq === frequency.WEEKLY || freq === 'WEEKLY') {
        const dayOfWeek = this.dueDate.getUTCDay();
        return `Toda(o) ${weeklyFrequency[dayOfWeek] || 'dia inválido'}`;
    }

    if (freq === frequency.MONTHLY || freq === 'MONTHLY') {
        const day = this.dueDate.getUTCDate();
        return `Todo dia ${day}`;
    }

    if (freq === frequency.YEARLY || freq === 'YEARLY') {
        const day = this.dueDate.getUTCDate();
        const month = this.dueDate.getUTCMonth() + 1;
        const nomeMes = monthlyFrequency[month];
        return `Todo dia ${day} de ${nomeMes}`;
    }

    return isoDateToBrazilianDate(this.dueDate);
});

investmentSchema.virtual('dueDateFormatted').get(function () {
    return isoDateToBrazilianDate(this.dueDate);
});

investmentSchema.virtual('startDateFormatted').get(function () {
    return isoDateToBrazilianDate(this.startDate);
});

investmentSchema.virtual('finishDateFormatted').get(function () {
    if (!this.finishDate) return null;
    return isoDateToBrazilianDate(this.finishDate);
});

export const Investment = mongoose.model("Investment", investmentSchema);