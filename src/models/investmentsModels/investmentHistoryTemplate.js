import mongoose from "mongoose";
import { investmentsCategories } from "./investmentsCategories.js";
import { isoDateToBrazilianDate } from "../../utils/normalizeDate.js";

const investmentHistoryTemplate = new mongoose.Schema({

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

    dueDate: {
        type: Date,
        required: true
    },

    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvestmentTemplate',
        default: null
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

investmentHistoryTemplate.virtual('dueDateFormatted').get(function () {
    if (!this.dueDate) return null;

    return isoDateToBrazilianDate(this.dueDate);
})

export const InvestmentHistory = mongoose.model("InvestmentHistory", investmentHistoryTemplate);