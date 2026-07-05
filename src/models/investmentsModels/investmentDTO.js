import { frequency, weeklyFrequency, monthlyFrequency } from "../frequencyEnum.js";

export function createInvestmentDTO({
    name,
    amount,
    investmentCategory,
    investmentFrequency,
    dueDate,
    startDate,
    templateId
}) {

    const isShortInvestment = !investmentFrequency || investmentFrequency === investmentFrequency.ONCE || investmentFrequency === "ONCE";

    let processedDueDate;

    if (isShortInvestment) {
        processedDueDate = new Date(dueDate);
    } else if (investmentFrequency === frequency.WEEKLY || investmentFrequency === "WEEKLY") {
        processedDueDate = Number(dueDate);
    } else if (investmentFrequency === frequency.MONTHLY || investmentFrequency === "MONTHLY") {
        processedDueDate = Number(dueDate);
    } else if (investmentFrequency === frequency.YEARLY || investmentFrequency === "YEARLY") {
        processedDueDate = typeof dueDate === 'object'
            ? { day: Number(dueDate.day), month: Number(dueDate.month) }
            : dueDate;
    } else {
        processedDueDate = dueDate;
    }

    return Object.freeze({
        name: String(name),
        amount: Number(amount),
        investmentCategory,
        investmentFrequency: isShortInvestment ? null : (frequency[investmentFrequency] || investmentFrequency),
        dueDate: processedDueDate,
        startDate: startDate ? new Date(startDate) : null,
        templateId: templateId || null
    });
}