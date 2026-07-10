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

export async function removeInvestment(id) {
    const target = await verifyExistence(id);

    if (!target) {
        throw new Error("INVESTMENT_NOT_FOUND");
    }

    if (target === 'existsInHistory') {
        await investmentRepo.deleteShortInvestment(id);
    } else {
        await investmentRepo.deleteLongInvestment(id);
    }
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