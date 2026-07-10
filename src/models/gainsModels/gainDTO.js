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