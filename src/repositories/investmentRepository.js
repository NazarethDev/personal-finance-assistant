import { InvestmentHistory } from "../models/investmentsModels/investmentHistoryTemplate.js";
import { InvestmentTemplate as LongInvestment } from "../models/investmentsModels/investmentTemplateSchema.js";

export async function checkHistoryExists(id) {
    return await InvestmentHistory.exists({ _id: id });
}

export async function checkTemplateExists(id) {
    return await LongInvestment.exists({ _id: id });
}

export async function saveShortInvestment(data) {
    return await InvestmentHistory.create(data);
}

export async function saveLongInvestment(data) {
    return await LongInvestment.create(data);
}

export async function deleteShortInvestment(id) {
    return await InvestmentHistory.findByIdAndDelete(id);
}

export async function deleteLongInvestment(id) {
    return await LongInvestment.findByIdAndDelete(id);
}

export async function updateShortInvestment(id, data) {
    return await InvestmentHistory.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
}

export async function updateLongInvestment(id, data) {
    return await LongInvestment.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
}