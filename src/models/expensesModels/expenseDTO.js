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
}