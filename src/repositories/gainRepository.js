import { GainHistory } from "../models/gainsModels/gainHistoryTemplate.js";
import { GainTemplate as LongGain } from "../models/gainsModels/gainTemplateSchema.js";

export async function checkHistoryExists(id) {
    return await GainHistory.exists({ _id: id });
}

export async function checkTemplateExists(id) {
    return await LongGain.exists({ _id: id });
}

export async function saveShortGain(data) {
    return await GainHistory.create(data);
}

export async function saveLongGain(data) {
    return await LongGain.create(data);
}

export async function updateLongGain(id, data) {
    return await LongGain.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
}

export async function updateShortGain(id, data) {
    return await GainHistory.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    )
}

export async function findHistoryById(id) {
    return await GainHistory.findById(id);
}

export async function findLongGainById(id) {
    return await LongGain.findById(id);
}

export async function deleteShortGain(id) {
    return await GainHistory.findByIdAndDelete(id);
}

export async function deleteLongGain(id) {
    return await LongGain.findByIdAndDelete(id);
}
export async function deleteHistoryByTemplateId(templateId) {
    return await GainHistory.deleteMany({ templateId: templateId })
}

export async function deleteHistoryFuture(templateId, dateReference) {
    return await GainHistory.deleteMany({
        templateId,
        dueDate: { $gte: dateReference }
    });
}

export async function deleteHistoryPast(templateId, dateReference) {
    return await GainHistory.deleteMany({
        templateId,
        dueDate: { $lt: dateReference }
    });
}