import { frequency } from "../frequencyEnum.js";
import { normalizeDate } from "../../utils/normalizeDate.js";

export function createInvestmentDTO({
    name,
    amount,
    category,
    frequency,
    dueDate,
    startDate,
    finishDate,
    seriesId
}) {
    const normalizedDueDate = normalizeDate(dueDate || startDate);
    const normalizedStartDate = normalizeDate(startDate || dueDate);
    const normalizedFinishDate = finishDate ? normalizeDate(finishDate) : null;

    const isShortInvestment = !frequency || frequency === frequency.ONCE || frequency === "ONCE";
    const normalizedFrequency = isShortInvestment
        ? (frequency.ONCE || 'apenas uma vez')
        : (frequency[frequency] || frequency);

    return {
        name: String(name),
        amount: Number(amount),
        category: category,
        frequency: normalizedFrequency,
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

    if (body.frequency !== undefined) {
        const isShort = !body.frequency || body.frequency === frequency.ONCE || body.frequency === "ONCE";
        updateData.frequency = isShort
            ? (frequency.ONCE || 'apenas uma vez')
            : (frequency[body.frequency] || body.frequency);
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