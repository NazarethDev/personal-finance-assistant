import * as investmentRepo from "../repositories/investmentRepository.js";
import { normalizeDate } from "../utils/normalizeDate.js";
import { isDueDateToday } from "../utils/isDueDateToday.js";

async function verifyExistence(id) {
    const existsInHistory = await investmentRepo.checkHistoryExists(id);
    if (existsInHistory) return 'existsInHistory';

    const existsInLongInvestment = await investmentRepo.checkTemplateExists(id);
    if (existsInLongInvestment) return 'existsInLongInvestment';

    return null;
}

export async function create(data) {

    if (data.investmentFrequency) {
        const newTemplate = await investmentRepo.saveLongInvestment(data);
        if (isDueDateToday(data.dueDate, data.investmentFrequency)) {
            await investmentRepo.saveShortInvestment({
                name: data.name,
                amount: data.amount,
                investmentCategory: data.investmentCategory,
                dueDate: normalizeDate(new Date()),
                templateId: newTemplate._id
            })
        }
        return newTemplate;
    }

    return await investmentRepo.saveShortInvestment(data);

}

export async function modifyInvestment(id, data) {
    const target = await verifyExistence(id);

    if (!target) {
        throw new Error("INVESTMENT_NOT_FOUND");
    }

    if (target === 'existsInHistory') {
        return await investmentRepo.updateShortInvestment(id, data);
    } else {
        return await investmentRepo.updateLongInvestment(id, data);
    }
}

export async function removeInvestment(id, deleteMode = "single") {
    const historyItem = await investmentRepo.findHistoryById(id);

    const templateItem = !historyItem ? await investmentRepo.findLongInvestmentById(id) : null;

    if (!historyItem && !templateItem) {
        throw new Error("INVESTMENT_NOT_FOUND");
    }

    const templateId = historyItem ? historyItem.templateId : templateItem._id;

    const today = normalizeDate(new Date());

    if (historyItem && !historyItem.templateId) {
        await investmentRepo.deleteShortInvestment(id);
        return;
    }

    switch (deleteMode) {
        case "all":
            await investmentRepo.deleteLongInvestment(templateId);
            await investmentRepo.deleteHistoryByTemplateId(templateId);
            break;
        case "future":
            await investmentRepo.deleteLongInvestment(templateId);
            await investmentRepo.deleteHistoryFuture(templateId, today);
            break;
        case "past":
            await investmentRepo.deleteHistoryPast(templateId, today);
            break;
        default:
            if (historyItem) {
                await investmentRepo.deleteShortInvestment(id);
            } else {
                await investmentRepo.deleteLongInvestment(id);
            }
            break;
    }
}