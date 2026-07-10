import mongoose from "mongoose";
import { gainsCategories } from "./gainsCategories.js";

import { isoDateToBrazilianDate } from "../../utils/normalizeDate.js";

const gainHistorySchema = new mongoose.Schema({
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

    dueDate: {
        type: Date,
        required: true
    },

    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GainTemplate',
        default: null
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

gainHistorySchema.virtual('dueDateFormatted').get(function () {
    if (!this.dueDate) return null;

    return isoDateToBrazilianDate(this.dueDate);
})

export const GainHistory = mongoose.model("GainHistory", gainHistorySchema)