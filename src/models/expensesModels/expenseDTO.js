import { frequency } from "../frequencyEnum.js";

import { normalizeDate } from "../../utils/normalizeDate.js";

export function createExpenseDTO({
    name,
    amount,
    expenseCategory,
    expenseFrequency,
    dueDate,
    startDate,
    finishDate,
    templateId
}) {
    const isShortExpense = !expenseFrequency || expenseFrequency === frequency.ONCE || expenseFrequency === "ONCE";

    let processedDueDate;

    const normalizedStartDate = normalizeDate(startDate);

    const normalizedFinishtDate = normalizeDate(finishDate);

    if (isShortExpense) {
        processedDueDate = normalizeDate(dueDate);
    } else if (expenseFrequency === frequency.WEEKLY || expenseFrequency === "WEEKLY") {
        processedDueDate = Number(dueDate);
    } else if (expenseFrequency === frequency.MONTHLY || expenseFrequency === "MONTHLY") {
        processedDueDate = Number(dueDate);
    } else if (expenseFrequency === frequency.YEARLY || expenseFrequency === "YEARLY") {
        processedDueDate = typeof dueDate === 'object'
            ? { day: Number(dueDate.day), month: Number(dueDate.month) }
            : dueDate;
    } else {
        processedDueDate = dueDate;
    }

    return Object.freeze({
        name: String(name),
        amount: Number(amount),
        expenseCategory,
        expenseFrequency: isShortExpense ? null : (frequency[expenseFrequency] || expenseFrequency),
        dueDate: processedDueDate,
        startDate: normalizedStartDate,
        finishDate: normalizedFinishtDate,
        templateId: templateId || null
    });
};

export function updateExpenseDTO(body) {
    const updateData = {};

    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.expenseCategory !== undefined) updateData.expenseCategory = body.expenseCategory;
    if (body.templateId !== undefined) updateData.templateId = body.templateId || null;

    if (body.expenseFrequency !== undefined) {
        const isShortExpense = !body.expenseFrequency || body.expenseFrequency === frequency.ONCE || body.expenseFrequency === "ONCE";
        updateData.expenseFrequency = isShortExpense ? null : (frequency[body.expenseFrequency] || body.expenseFrequency);
    }

    if (body.startDate !== undefined) updateData.startDate = normalizeDate(body.startDate);
    if (body.finishDate !== undefined) updateData.finishDate = normalizeDate(body.finishDate);

    if (body.dueDate !== undefined) {
        const freq = body.expenseFrequency;

        if (freq !== undefined) {
            const isShort = !freq || freq === frequency.ONCE || freq === "ONCE";
            if (isShort) {
                updateData.dueDate = normalizeDate(body.dueDate);
            } else if (freq === "WEEKLY" || freq === frequency.WEEKLY || freq === "MONTHLY" || freq === frequency.MONTHLY) {
                updateData.dueDate = Number(body.dueDate);
            } else if (freq === "YEARLY" || freq === frequency.YEARLY) {
                updateData.dueDate = typeof body.dueDate === 'object'
                    ? { day: Number(body.dueDate.day), month: Number(body.dueDate.month) } 
                    : body.dueDate;
            }
        } else {
            if (typeof body.dueDate === 'object' && body.dueDate !== null && 'day' in body.dueDate) {
                updateData.dueDate = { day: Number(body.dueDate.day), month: Number(body.dueDate.month) };
            } else if (!isNaN(body.dueDate) && String(body.dueDate).length <= 2) {
                updateData.dueDate = Number(body.dueDate);
            } else {
                updateData.dueDate = normalizeDate(body.dueDate);
            }
        }
    }

    return updateData;
}