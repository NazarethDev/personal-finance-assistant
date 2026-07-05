import { frequency } from "../frequencyEnum.js";

export function createGainDTO({
    name,
    amount,
    gainCategory,
    gainFrequency,
    dueDate,
    startDate,
    templateId
}) {

    const isShortGain = !gainFrequency || gainFrequency === frequency.ONCE || gainFrequency === "ONCE";

    let processedDueDate;

    if (isShortGain) {
        processedDueDate = new Date(dueDate);
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
        startDate: startDate ? new Date(startDate) : null,
        templateId: templateId || null
    });
}