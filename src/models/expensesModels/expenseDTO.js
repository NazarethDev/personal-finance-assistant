import { frequency } from "../frequencyEnum.js";
import { normalizeDate } from "../../utils/normalizeDate.js";
import { normalizeCurrency } from "../../utils/normalizeCurrency.js";

export function createExpenseDTO({
    name,
    currency,
    amount,
    category,
    frequency,
    dueDate,
    startDate,
    finishDate,
    seriesId,
    preferredCurrency
}) {
    const normalizedDueDate = normalizeDate(dueDate || startDate);
    const normalizedStartDate = normalizeDate(startDate || dueDate);
    const normalizedFinishDate = finishDate ? normalizeDate(finishDate) : null;
    const normalizedCurrency = normalizeCurrency(currency, preferredCurrency);

    const isShortExpense = !frequency || frequency === frequency.ONCE || frequency === "ONCE";
    const normalizedFrequency = isShortExpense
        ? (frequency.ONCE || 'apenas uma vez')
        : (frequency[frequency] || frequency);

    return {
        name: String(name),
        currency: normalizedCurrency,
        amount: Number(amount),
        category: category,
        frequency: normalizedFrequency,
        seriesId: seriesId || null,
        dueDate: normalizedDueDate,
        startDate: normalizedStartDate,
        finishDate: normalizedFinishDate
    };
}

export function updateExpenseDTO(body) {
    const updateData = {};
    const preferredCurrency = body.preferredCurrency;

    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.currency !== undefined) updateData.currency = normalizeCurrency(body.currency, preferredCurrency);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.seriesId !== undefined) updateData.seriesId = body.seriesId || null;

    if (body.frequency !== undefined) {
        const isShort = !body.frequency || body.frequency === frequency.ONCE || body.frequency === "ONCE";

        if (isShort) {
            updateData.frequency = frequency.ONCE;
        } else {
            updateData.frequency = frequency[body.frequency] || body.frequency;
        }
    }

    if (body.dueDate !== undefined) updateData.dueDate = normalizeDate(body.dueDate);
    if (body.startDate !== undefined) updateData.startDate = normalizeDate(body.startDate);
    if (body.finishDate !== undefined) updateData.finishDate = body.finishDate ? normalizeDate(body.finishDate) : null;

    return {
        updateData,
        mode: body.mode
    };
} 