import { Investment } from "../models/investmentsModels/Investment.js";

export async function checkExists(id) {
    return await Investment.exists({ _id: id });
}

export async function createSingle(data) {
    return await Investment.create(data);
}

export async function createMany(investmentsArray) {
    return await Investment.insertMany(investmentsArray);
}

export async function update(id, updateData) {
    return await Investment.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
}

export async function updateAllInSeries(seriesId, updateData) {
    return await Investment.updateMany({ seriesId }, updateData);
}

export async function updateFutureInSeries(seriesId, fromDate, updateData) {
    return await Investment.updateMany(
        { seriesId, dueDate: { $gte: fromDate } },
        updateData
    );
}

export async function updatePastInSeries(seriesId, toDate, updateData) {
    return await Investment.updateMany(
        { seriesId, dueDate: { $lte: toDate } },
        updateData
    );
}

export async function deleteById(id) {
    return await Investment.findByIdAndDelete(id);
}

export async function deleteAllInSeries(seriesId) {
    return await Investment.deleteMany({ seriesId });
}

export async function deleteFutureInSeries(seriesId, fromDate) {
    return await Investment.deleteMany({
        seriesId,
        dueDate: { $gte: fromDate }
    });
}

export async function deletePastInSeries(seriesId, toDate) {
    return await Investment.deleteMany({
        seriesId,
        dueDate: { $lte: toDate }
    });
}

export async function findBySeries(seriesId, fromDate = null) {
    const query = { seriesId };
    if (fromDate) {
        query.dueDate = { $gte: fromDate };
    }

    return await Investment.find(query).populate("category").sort({ dueDate: 1 });
}

export async function findByMonth(year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Investment.find({
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate("category").sort({ dueDate: 1 });
}

export async function findByCategoryAndMonth(categoryId, year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Investment.find({
        category: categoryId,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate("category").sort({ dueDate: 1 });
}

export async function findById(id) {
    return await Investment.findById(id).populate("category");
}