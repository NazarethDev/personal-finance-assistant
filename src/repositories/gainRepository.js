import { Gain } from "../models/gainsModels/Gain.js";

export async function checkExists(userId, id) {
    return await Gain.exists({ _id: id, user: userId });
}

export async function createSingle(data) {
    return await Gain.create(data);
}

export async function createMany(gainsArray) {
    return await Gain.insertMany(gainsArray);
}

export async function update(userId, id, updateData) {
    return await Gain.findOneAndUpdate({ _id: id, user: userId }, updateData, { returnDocument: 'after' });
}

export async function updateAllInSeries(userId, seriesId, updateData) {
    return await Gain.updateMany({ seriesId, user: userId }, updateData);
}

export async function updateFutureInSeries(userId, seriesId, fromDate, updateData) {
    return await Gain.updateMany(
        { seriesId, user: userId, dueDate: { $gte: fromDate } },
        updateData
    );
}

export async function updatePastInSeries(userId, seriesId, toDate, updateData) {
    return await Gain.updateMany(
        { seriesId, user: userId, dueDate: { $lte: toDate } },
        updateData
    );
}

export async function deleteById(userId, id) {
    return await Gain.findOneAndDelete({ _id: id, user: userId });
}

export async function deleteAllInSeries(userId, seriesId) {
    return await Gain.deleteMany({ seriesId, user: userId });
}

export async function deleteFutureInSeries(userId, seriesId, fromDate) {
    return await Gain.deleteMany({
        seriesId,
        user: userId,
        dueDate: { $gte: fromDate }
    });
}

export async function deletePastInSeries(userId, seriesId, toDate) {
    return await Gain.deleteMany({
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

    return await Gain.find(query).populate("category").sort({ dueDate: 1 });
}

export async function findByMonth(userId, year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Gain.find({
        user: userId,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate("category").sort({ dueDate: 1 });
}

export async function findByCategoryAndMonth(userId, categoryId, year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Gain.find({
        user: userId,
        category: categoryId,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate("category").sort({ dueDate: 1 });
}

export async function findById(userId, id) {
    return await Gain.findOne({ _id: id, user: userId }).populate("category");
}