import { frequency } from "../frequencyEnum.js";
import { normalizeDate } from "../../utils/normalizeDate.js";

export function createExpenseDTO({
    name,
    amount,
    category,
    expenseFrequency,
    dueDate,
    startDate,
    finishDate,
    seriesId
}) {
    const normalizedDueDate = normalizeDate(dueDate || startDate);
    const normalizedStartDate = normalizeDate(startDate || dueDate);
    const normalizedFinishDate = finishDate ? normalizeDate(finishDate) : null;

    const isShortExpense = !expenseFrequency || expenseFrequency === frequency.ONCE || expenseFrequency === "ONCE";
    const normalizedFrequency = isShortExpense
        ? (frequency.ONCE || 'apenas uma vez')
        : (frequency[expenseFrequency] || expenseFrequency);

    return {
        name: String(name),
        amount: Number(amount),
        category: category,
        expenseFrequency: normalizedFrequency,
        seriesId: seriesId || null,
        dueDate: normalizedDueDate,
        startDate: normalizedStartDate,
        finishDate: normalizedFinishDate
    };
}

export function updateExpenseDTO(body) {
    const updateData = {};

    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.seriesId !== undefined) updateData.seriesId = body.seriesId || null;

    if (body.expenseFrequency !== undefined) {
        const isShort = !body.expenseFrequency || body.expenseFrequency === frequency.ONCE || body.expenseFrequency === "ONCE";
        updateData.expenseFrequency = isShort
            ? (frequency.ONCE || 'apenas uma vez')
            : (frequency[body.expenseFrequency] || body.expenseFrequency);
    }

    if (body.dueDate !== undefined) updateData.dueDate = normalizeDate(body.dueDate);
    if (body.startDate !== undefined) updateData.startDate = normalizeDate(body.startDate);
    if (body.finishDate !== undefined) updateData.finishDate = body.finishDate ? normalizeDate(body.finishDate) : null;

    const validModes = ['SINGLE', 'ALL', 'FUTURE', 'PAST'];
    const mode = validModes.includes(body.mode) ? body.mode : 'SINGLE';

    return {
        updateData,
        mode
    };
}