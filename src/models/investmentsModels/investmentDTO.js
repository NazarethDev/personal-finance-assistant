import { frequency } from "../frequencyEnum.js";
import { normalizeDate } from "../../utils/normalizeDate.js";

export function createInvestmentDTO({
    name,
    amount,
    category,
    investmentFrequency,
    dueDate,
    startDate,
    finishDate,
    seriesId
}) {
    const normalizedDueDate = normalizeDate(dueDate || startDate);
    const normalizedStartDate = normalizeDate(startDate || dueDate);
    const normalizedFinishDate = finishDate ? normalizeDate(finishDate) : null;

    const isShortInvestment = !investmentFrequency || investmentFrequency === frequency.ONCE || investmentFrequency === "ONCE";
    const normalizedFrequency = isShortInvestment
        ? (frequency.ONCE || 'apenas uma vez')
        : (frequency[investmentFrequency] || investmentFrequency);

    return {
        name: String(name),
        amount: Number(amount),
        category: category,
        investmentFrequency: normalizedFrequency,
        seriesId: seriesId || null,
        dueDate: normalizedDueDate,
        startDate: normalizedStartDate,
        finishDate: normalizedFinishDate
    };
}

export function updateInvestmentDTO(body) {
    const updateData = {}; 

    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.seriesId !== undefined) updateData.seriesId = body.seriesId || null;

    if (body.investmentFrequency !== undefined) {
        const isShort = !body.investmentFrequency || body.investmentFrequency === frequency.ONCE || body.investmentFrequency === "ONCE";
        updateData.investmentFrequency = isShort
            ? (frequency.ONCE || 'apenas uma vez')
            : (frequency[body.investmentFrequency] || body.investmentFrequency);
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