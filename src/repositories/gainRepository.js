import { Gain } from "../models/gainsModels/Gain.js";

export async function checkExists(id) {
    return await Gain.exists({ _id: id });
}

export async function createSingle(data) {
    return await Gain.create(data);
}

export async function createMany(gainsArray) {
    return await Gain.insertMany(gainsArray);
}

export async function findById(id) {
    return await Gain.findById(id);
}

export async function update(id, updateData) {
    return await Gain.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
}

export async function updateAllInSeries(seriesId, updateData) {
    return await Gain.updateMany({ seriesId }, updateData);
}

export async function updateFutureInSeries(seriesId, fromDate, updateData) {
    return await Gain.updateMany(
        { seriesId, dueDate: { $gte: fromDate } },
        updateData
    );
}

export async function updatePastInSeries(seriesId, toDate, updateData) {
    return await Gain.updateMany(
        { seriesId, dueDate: { $lte: toDate } },
        updateData
    );
}


export async function deleteById(id) {
    return await Gain.findByIdAndDelete(id);
}

export async function deleteAllInSeries(seriesId) {
    return await Gain.deleteMany({ seriesId });
}

export async function deleteFutureInSeries(seriesId, fromDate) {
    return await Gain.deleteMany({
        seriesId,
        dueDate: { $gte: fromDate }
    });
}

export async function deletePastInSeries(seriesId, toDate) {
    return await Gain.deleteMany({
        seriesId,
        dueDate: { $lte: toDate }
    });
}

export async function findBySeries(seriesId, fromDate = null) {
    const query = { seriesId };
    if (fromDate) {
        query.dueDate = { $gte: fromDate };
    }

    return await Gain.find(query).sort({ dueDate: 1 });
}

export async function findByMonth(year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Gain.find({
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ dueDate: 1 });
}

export async function findByCategoryAndMonth(category, year, month) {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await Gain.find({
        category,
        dueDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ dueDate: 1 });
}