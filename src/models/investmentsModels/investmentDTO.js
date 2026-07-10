import { frequency, weeklyFrequency, monthlyFrequency } from "../frequencyEnum.js";
import { normalizeDate } from "../../utils/normalizeDate.js";

export function createInvestmentDTO({
    name,
    amount,
    investmentCategory,
    investmentFrequency,
    dueDate,
    startDate,
    finishDate,
    templateId
}) {

    const isShortInvestment = !investmentFrequency || investmentFrequency === investmentFrequency.ONCE || investmentFrequency === "ONCE";

    let processedDueDate;

    const normalizedStartDate = normalizeDate(startDate);

    const normalizedFinishtDate = normalizeDate(finishDate);

    if (isShortInvestment) {
        processedDueDate = normalizeDate(dueDate);
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
        startDate: normalizedStartDate,
        finishDate: normalizedFinishtDate,
        templateId: templateId || null
    });
}