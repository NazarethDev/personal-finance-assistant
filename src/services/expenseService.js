import * as expenseRepo from "../repositories/expenseRepository.js";

import { normalizeDate } from "../utils/normalizeDate.js";
import { isDueDateToday } from "../utils/isDueDateToday.js";

async function verifyExistence(id) {
    const existsInHistory = await expenseRepo.checkHistoryExists(id);
    if (existsInHistory) return 'existsInHistory';

    const existsInLongExpense = await expenseRepo.checkTemplateExists(id);
    if (existsInLongExpense) return 'existsInLongExpense';

    return null;
}

export async function create(data) {
    if (data.expenseFrequency) {
        const newTemplate = await expenseRepo.saveLongExpense(data);
        if (isDueDateToday(data.dueDate, data.expenseFrequency)) {
            await expenseRepo.saveShortExpense({
                name: data.name,
                amount: data.amount,
                expenseCategory: data.expenseCategory,
                dueDate: normalizeDate(new Date()),
                templateId: newTemplate._id
            });

        }
        return newTemplate;

    };

    return await expenseRepo.saveShortExpense(data);
}

export async function modifyExpense(id, data) {
    const target = await verifyExistence(id);

    if (!target) {
        throw new Error("EXPENSE_NOT_FOUND");
    }

    if (target === 'existsInHistory') {
        return await expenseRepo.updateShortExpense(id, data);
    } else {
        return await expenseRepo.updateLongExpense(id, data);
    }
}

export async function removeExpense(id, deleteMode = "single") {
    const historyItem = await expenseRepo.findHistoryById(id);

    const templateItem = !historyItem ? await expenseRepo.findLongExpenseById(id) : null;

    if (!historyItem && !templateItem) {
        throw new Error("EXPENSE_NOT_FOUND");
    }

    const templateId = historyItem ? historyItem.templateId : templateItem._id;

    const today = normalizeDate(new Date());

    if (historyItem && !historyItem.templateId) {
        await expenseRepo.deleteShortExpense(id);
        return;
    }

    switch (deleteMode) {
        case "all":
            await expenseRepo.deleteLongExpense(templateId);
            await expenseRepo.deleteHistoryByTemplateId(templateId);
            break;

        case "future":
            await expenseRepo.deleteLongExpense(templateId);
            await expenseRepo.deleteHistoryFuture(templateId, today);
            break;

        case "past":
            await expenseRepo.deleteHistoryPast(templateId, today);
            break;

        case "single":
        default:
            if (historyItem) {
                await expenseRepo.deleteShortExpense(id);
            } else {
                await expenseRepo.deleteLongExpense(id);
            }
            break;
    }
}