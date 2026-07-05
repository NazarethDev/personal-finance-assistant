import { frequency } from "../frequencyEnum.js";

export function createExpenseDTO({
    name,
    amount,
    expenseCategory,
    expenseFrequency,
    dueDate,
    startDate,
    templateId
}) {
    const isShortExpense = !expenseFrequency || expenseFrequency === frequency.ONCE || expenseFrequency === "ONCE";

    let processedDueDate;

    if (isShortExpense) {
        processedDueDate = new Date(dueDate);
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
        startDate: startDate ? new Date(startDate) : null,
        templateId: templateId || null
    });
}