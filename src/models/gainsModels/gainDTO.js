import { frequency } from "../frequencyEnum.js";
import { normalizeDate } from "../../utils/normalizeDate.js"

export function createGainDTO({
    name,
    amount,
    gainCategory,
    gainFrequency,
    dueDate,
    startDate,
    finishDate,
    templateId
}) {

    const isShortGain = !gainFrequency || gainFrequency === frequency.ONCE || gainFrequency === "ONCE";

    let processedDueDate;

    const normalizedStartDate = normalizeDate(startDate);

    const normalizedFinishtDate = normalizeDate(finishDate);

    if (isShortGain) {
        processedDueDate = normalizeDate(dueDate);
    } else if (gainFrequency === frequency.WEEKLY || gainFrequency === "WEEKLY") {
        processedDueDate = Number(dueDate);
    } else if (gainFrequency === frequency.MONTHLY || gainFrequency === "MONTHLY") {
        processedDueDate = Number(dueDate);
    } else if (gainFrequency === frequency.YEARLY || gainFrequency === "YEARLY") {
        processedDueDate = typeof dueDate === 'object'
            ? { day: Number(dueDate.day), month: Number(dueDate.month) }
            : dueDate;
    } else {
        processedDueDate = dueDate;
    }

    return Object.freeze({
        name: String(name),
        amount: Number(amount),
        gainCategory,
        gainFrequency: isShortGain ? null : (frequency[gainFrequency] || gainFrequency),
        dueDate: processedDueDate,
        startDate: normalizedStartDate,
        finishDate: normalizedFinishtDate,
        templateId: templateId || null
    });
}

export function updateGainDTO(body) {
    const updateData = {};

    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.gainCategory !== undefined) updateData.gainCategory = body.gainCategory;
    if (body.templateId !== undefined) updateData.templateId = body.templateId || null; 

    if (body.gainFrequency !== undefined) {
        const isShortGain = !body.gainFrequency || body.gainFrequency === frequency.ONCE || body.gainFrequency === "ONCE";
        updateData.gainFrequency = isShortGain ? null : (frequency[body.gainFrequency] || body.gainFrequency);
    }

    if (body.startDate !== undefined) updateData.startDate = normalizeDate(body.startDate);
    if (body.finishDate !== undefined) updateData.finishDate = normalizeDate(body.finishDate);

    if (body.dueDate !== undefined) {
        const freq = body.gainFrequency;

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

    return Object.freeze(updateData);
}