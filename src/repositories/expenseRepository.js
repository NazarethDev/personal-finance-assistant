import { Expense } from "../models/expensesModels/Expense.js";

export async function checkExists(id) {
    return await Expense.exists({ _id: id });
}

export async function createSingle(data) {
    return await Expense.create(data);
}

export async function createMany(expensesArray) {
    return await Expense.insertMany(expensesArray);
}

export async function findById(id) {
    return await Expense.findById(id);
}

export async function update(id, updateData) {
    return await Expense.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
}

export async function updateAllInSeries(seriesId, updateData) {
    return await Expense.updateMany({ seriesId }, updateData);
}

export async function updateFutureInSeries(seriesId, fromDate, updateData) {
    return await Expense.updateMany(
        { seriesId, dueDate: { $gte: fromDate } },
        updateData
    );
}

export async function updatePastInSeries(seriesId, toDate, updateData) {
    return await Expense.updateMany(
        { seriesId, dueDate: { $lte: toDate } },
        updateData
    );
}

export async function deleteById(id) {
    return await Expense.findByIdAndDelete(id);
}

export async function deleteAllInSeries(seriesId) {
    return await Expense.deleteMany({ seriesId });
}

export async function deleteFutureInSeries(seriesId, fromDate) {
    return await Expense.deleteMany({
        seriesId,
        dueDate: { $gte: fromDate }
    });
}

export async function deletePastInSeries(seriesId, toDate) {
    return await Expense.deleteMany({
        seriesId,
        dueDate: { $lte: toDate }
    });
}

export async function findBySeries(seriesId, fromDate = null) {
    const query = { seriesId };
    if (fromDate) {
        query.dueDate = { $gte: fromDate };
    }

    return await Expense.find(query).sort({ dueDate: 1 });
}

export async function findByMonth(year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Expense.find({
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ dueDate: 1 });
}

export async function findByCategoryAndMonth(category, year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Expense.find({
        category,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ dueDate: 1 });
}