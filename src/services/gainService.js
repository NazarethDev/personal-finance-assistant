import mongoose from "mongoose";
import * as gainRepo from "../repositories/gainRepository.js";

import { normalizeDate } from "../utils/normalizeDate.js";
import { calculateNextDate } from "../utils/calculateNextDate.js";
import { frequency } from "../models/frequencyEnum.js"

async function verifyExistence(id) {
    return await gainRepo.checkExists(id);
}

export async function create(data) {
    const isRecurrent = data.gainFrequency &&
        data.gainFrequency !== frequency.ONCE &&
        data.gainFrequency !== 'ONCE';

    if (!isRecurrent) {
        return await gainRepo.createSingle({
            ...data,
            seriesId: null
        });
    }

    const seriesId = new mongoose.Types.ObjectId();
    const gainsToCreate = [];

    let currentDueDate = new Date(data.dueDate);
    const startDate = new Date(data.startDate);

    let limitDate = data.finishDate ? new Date(data.finishDate) : new Date(startDate);
    if (!data.finishDate) {
        limitDate.setUTCFullYear(limitDate.getUTCFullYear() + 1);
    }

    while (currentDueDate <= limitDate) {
        gainsToCreate.push({
            name: data.name,
            amount: data.amount,
            category: data.category,
            gainFrequency: data.gainFrequency,
            seriesId: seriesId,
            dueDate: new Date(currentDueDate),
            startDate: startDate,
            finishDate: data.finishDate ? new Date(data.finishDate) : null
        });

        currentDueDate = calculateNextDate(currentDueDate, data.gainFrequency);
    }

    const createdGains = await gainRepo.createMany(gainsToCreate);

    return createdGains;
}

export async function modifyGain(id, { updateData, mode }) {
    const target = await gainRepo.findById(id);

    if (!target) {
        throw new Error("GAIN_NOT_FOUND");
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await gainRepo.update(id, updateData);
    }

    switch (mode) {
        case 'ALL':
            const dataToUpdateAll = { ...updateData };
            delete dataToUpdateAll.dueDate;

            await gainRepo.updateAllInSeries(target.seriesId, dataToUpdateAll);
            break;

        case 'FUTURE':
            const dataToUpdateFuture = { ...updateData };
            delete dataToUpdateFuture.dueDate;

            await gainRepo.updateFutureInSeries(target.seriesId, target.dueDate, dataToUpdateFuture);
            break;

        case 'PAST':
            const dataToUpdatePast = { ...updateData };
            delete dataToUpdatePast.dueDate;

            await gainRepo.updatePastInSeries(target.seriesId, target.dueDate, dataToUpdatePast);
            break;
    }

    return await gainRepo.update(id, updateData);
}

export async function removeGain(id, mode = 'SINGLE') {
    const target = await gainRepo.findById(id);

    if (!target) {
        throw new Error("GAIN_NOT_FOUND");
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await gainRepo.deleteById(id);
    }

    switch (mode) {
        case 'ALL':
            return await gainRepo.deleteAllInSeries(target.seriesId);

        case 'FUTURE':
            return await gainRepo.deleteFutureInSeries(target.seriesId, target.dueDate);

        case 'PAST':
            return await gainRepo.deletePastInSeries(target.seriesId, target.dueDate);

        default:
            return await gainRepo.deleteById(id);
    }
}