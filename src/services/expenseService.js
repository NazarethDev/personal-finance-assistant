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

export async function removeExpense(id) {
    const target = await verifyExistence(id);

    if (!target) {
        throw new Error("EXPENSE_NOT_FOUND");
    }

    if (target === 'existsInHistory') {
        await expenseRepo.deleteShortExpense(id);
    } else {
        await expenseRepo.deleteLongExpense(id);
    }
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