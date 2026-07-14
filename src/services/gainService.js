import * as gainRepo from "../repositories/gainRepository.js";
import { normalizeDate } from "../utils/normalizeDate.js";
import { isDueDateToday } from "../utils/isDueDateToday.js";

async function verifyExistence(id) {
    const existsInHistory = await gainRepo.checkHistoryExists(id);
    if (existsInHistory) return 'existsInGainHistory';

    const existsInLongGain = await gainRepo.checkTemplateExists(id);
    if (existsInLongGain) return 'existsInLongGain';

    return null;
}

export async function create(data) {

    if (data.gainFrequency) {
        const newTemplate = await gainRepo.saveLongGain(data);
        if (isDueDateToday(data.dueDate, data.gainFrequency)) {
            await gainRepo.saveShortGain({
                name: data.name,
                amount: data.amount,
                gainCategory: data.gainCategory,
                dueDate: normalizeDate(new Date()),
                templateId: newTemplate._id
            });

        }
        return newTemplate;
    }

    return await gainRepo.saveShortGain(data);
}

export async function modifyGain(id, data) {
    const target = await verifyExistence(id);

    if (!target) {
        throw new Error("GAIN_NOT_FOUND");
    }

    if (target === 'existsInGainHistory') {
        return await gainRepo.updateShortGain(id, data);
    } else {
        return await gainRepo.updateLongGain(id, data);
    }
}

export async function removeGain(id, deleteMode = "single") {

    const historyItem = await gainRepo.findHistoryById(id);

    const templateItem = !historyItem ? await gainRepo.findLongGainById(id) : null;

    if (!historyItem && !templateItem) {
        throw new Error("GAIN_NOT_FOUND");
    }

    const templateId = historyItem ? historyItem.templateId : templateItem._id;

    const today = normalizeDate(new Date());

    if (historyItem && !historyItem.templateId) {
        await gainRepo.deleteShortGain(id);
        return;
    }

    switch (deleteMode) {
        case "all":
            await gainRepo.deleteLongGain(templateId);
            await gainRepo.deleteHistoryByTemplateId(templateId);
            break;

        case "future":
            await gainRepo.deleteLongGain(templateId);
            await gainRepo.deleteHistoryFuture(templateId, today);
            break;

        case "past":
            await gainRepo.deleteHistoryPast(templateId, today);
            break;

        case "single":
        default:
            if (historyItem) {
                await gainRepo.deleteShortGain(id);
            } else {
                await gainRepo.deleteLongGain(id);
            }
            break;
    }

}