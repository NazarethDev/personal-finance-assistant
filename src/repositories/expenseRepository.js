import { Expense } from "../models/expensesModels/Expense.js";

export async function checkExists(userId, id) {
    return await Expense.exists({ _id: id, user: userId });
}

export async function createSingle(data) {
    return await Expense.create(data);
}

export async function createMany(expensesArray) {
    return await Expense.insertMany(expensesArray);
}

export async function update(userId, id, updateData) {
    return await Expense.findOneAndUpdate({ _id: id, user: userId }, updateData, { returnDocument: 'after' });
}

export async function updateAllInSeries(userId, seriesId, updateData) {
    return await Expense.updateMany({ seriesId, user: userId }, updateData);
}

export async function updateFutureInSeries(userId, seriesId, fromDate, updateData) {
    return await Expense.updateMany(
        { seriesId, user: userId, dueDate: { $gte: fromDate } },
        updateData
    );
}

export async function updatePastInSeries(userId, seriesId, toDate, updateData) {
    return await Expense.updateMany(
        { seriesId, user: userId, dueDate: { $lte: toDate } },
        updateData
    );
}

export async function deleteById(userId, id) {
    return await Expense.findOneAndDelete({ _id: id, user: userId });
}

export async function deleteAllInSeries(userId, seriesId) {
    return await Expense.deleteMany({ seriesId, user: userId });
}

export async function deleteFutureInSeries(userId, seriesId, fromDate) {
    return await Expense.deleteMany({
        seriesId,
        user: userId,
        dueDate: { $gte: fromDate }
    });
}

export async function deletePastInSeries(userId, seriesId, toDate) {
    return await Expense.deleteMany({
        seriesId,
        user: userId,
        dueDate: { $lte: toDate }
    });
}

export async function findBySeries(userId, seriesId, fromDate = null) {
    const query = { seriesId, user: userId };
    if (fromDate) {
        query.dueDate = { $gte: fromDate };
    }

    return await Expense.find(query).populate("category").sort({ dueDate: 1 });
}

export async function findByMonth(userId, year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Expense.find({
        user: userId,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate("category").sort({ dueDate: 1 }).lean();
}

export async function findByCategoryAndMonth(userId, categoryId, year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Expense.find({
        user: userId,
        category: categoryId,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate("category").sort({ dueDate: 1 });
}

export async function findById(userId, id) {
    return await Expense.findOne({ _id: id, user: userId }).populate("category");
}

export async function findInCurrency(userId, currency, year, month) {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return await Expense.find({
        user: userId,
        currency: currency,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate("category").sort({ dueDate: 1 }).lean();
}