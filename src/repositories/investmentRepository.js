import { Investment } from "../models/investmentsModels/Investment.js";

export async function checkExists(id) {
    return await Investment.exists({ _id: id });
}

export async function createSingle(data) {
    return await Investment.create(data);
}

export async function createMany(expensesArray) {
    return await Investment.insertMany(expensesArray);
}

export async function findById(id) {
    return await Investment.findById(id);
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