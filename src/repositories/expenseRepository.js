import { ExpenseHistory } from "../models/expensesModels/expenseHistorySchema.js";
import { ExpenseTemplate as LongExpense } from "../models/expensesModels/expenseTemplateSchema.js";

export async function checkHistoryExists(id) {
    return await ExpenseHistory.exists({ _id: id });
}

export async function checkTemplateExists(id) {
    return await LongExpense.exists({ _id: id });
}

export async function saveShortExpense(data) {
    return await ExpenseHistory.create(data);
}

export async function saveLongExpense(data) {
    return await LongExpense.create(data);
}
export async function updateShortExpense(id, data) {
    return await ExpenseHistory.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
}

export async function updateLongExpense(id, data) {
    return await LongExpense.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
}

export async function findHistoryById(id) {
    return await ExpenseHistory.findById(id);
}

export async function findLongExpenseById(id) {
    return await LongExpense.findById(id);
}

export async function deleteShortExpense(id) {
    return await ExpenseHistory.findByIdAndDelete(id);
}

export async function deleteLongExpense(id) {
    return await LongExpense.findByIdAndDelete(id);
}
export async function deleteHistoryByTemplateId(templateId) {
    return await ExpenseHistory.deleteMany({ templateId: templateId })
}

export async function deleteHistoryFuture(templateId, dateReference) {
    return await ExpenseHistory.deleteMany({
        templateId,
        dueDate: { $gte: dateReference }
    });
}

export async function deleteHistoryPast(templateId, dateReference) {
    return await ExpenseHistory.deleteMany({
        templateId,
        dueDate: { $lt: dateReference }
    });
}