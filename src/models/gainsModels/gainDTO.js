import { frequency } from "../frequencyEnum.js";
import { normalizeDate } from "../../utils/normalizeDate.js";

export function createGainDTO({
    name,
    amount,
    category,
    gainFrequency,
    dueDate,
    startDate,
    finishDate,
    seriesId
}) {
    const normalizedDueDate = normalizeDate(dueDate || startDate);
    const normalizedStartDate = normalizeDate(startDate || dueDate);
    const normalizedFinishDate = finishDate ? normalizeDate(finishDate) : null;

    const isShortGain = !gainFrequency || gainFrequency === frequency.ONCE || gainFrequency === "ONCE";
    const normalizedFrequency = isShortGain
        ? (frequency.ONCE || 'apenas uma vez')
        : (frequency[gainFrequency] || gainFrequency);

    return {
        name: String(name),
        amount: Number(amount),
        category: category,
        gainFrequency: normalizedFrequency,
        seriesId: seriesId || null,
        dueDate: normalizedDueDate,
        startDate: normalizedStartDate,
        finishDate: normalizedFinishDate
    };
}

export function updateGainDTO(body) {
    const updateData = {};

    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.seriesId !== undefined) updateData.seriesId = body.seriesId || null;

    if (body.gainFrequency !== undefined) {
        const isShort = !body.gainFrequency || body.gainFrequency === frequency.ONCE || body.gainFrequency === "ONCE";
        updateData.gainFrequency = isShort
            ? (frequency.ONCE || 'apenas uma vez')
            : (frequency[body.gainFrequency] || body.gainFrequency);
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