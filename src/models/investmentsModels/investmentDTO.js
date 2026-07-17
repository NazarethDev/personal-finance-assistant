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

export function updateInvestmentDTO(body) {
    const updateData = {};

    if (body.name !== undefined) updateData.name = String(body.name);
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.investmentCategory !== undefined) updateData.investmentCategory = body.investmentCategory;
    if (body.templateId !== undefined) updateData.templateId = body.templateId || null;

    if (body.investmentFrequency !== undefined) {
        const isShortInvestment = !body.investmentFrequency || body.investmentFrequency === frequency.ONCE || body.investmentFrequency === "ONCE";
        updateData.investmentFrequency = isShortInvestment ? null : (frequency[body.investmentFrequency] || body.investmentFrequency);
    }

    if (body.startDate !== undefined) updateData.startDate = normalizeDate(body.startDate);
    if (body.finishDate !== undefined) updateData.finishDate = normalizeDate(body.finishDate);

    if (body.dueDate !== undefined) {
        const freq = body.investmentFrequency;

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

    return updateData;
}