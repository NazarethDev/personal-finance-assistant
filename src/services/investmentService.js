import mongoose from "mongoose";
import * as investmentRepo from "../repositories/investmentRepository.js";

import { normalizeDate } from "../utils/normalizeDate.js";
import { calculateNextDate } from "../utils/calculateNextDate.js";
import { frequency } from "../models/frequencyEnum.js";

export async function create(data) {
    const isRecurrent = data.frequency &&
        data.frequency !== frequency.ONCE &&
        data.frequency !== 'ONCE';

    if (!isRecurrent) {
        return await investmentRepo.createSingle({
            ...data,
            seriesId: null
        });
    }

    const seriesId = new mongoose.Types.ObjectId();
    const investmentsToCreate = [];

    let currentDueDate = new Date(data.dueDate);
    const startDate = new Date(data.startDate);

    let limitDate = data.finishDate ? new Date(data.finishDate) : new Date(startDate);
    if (!data.finishDate) {
        limitDate.setUTCFullYear(limitDate.getUTCFullYear() + 1);
    }

    while (currentDueDate <= limitDate) {
        investmentsToCreate.push({
            name: data.name,
            amount: data.amount,
            category: data.category,
            frequency: data.frequency,
            seriesId: seriesId,
            dueDate: new Date(currentDueDate),
            startDate: startDate,
            finishDate: data.finishDate ? new Date(data.finishDate) : null
        });

        currentDueDate = calculateNextDate(currentDueDate, data.frequency);
    }

    const createdInvestments = await investmentRepo.createMany(investmentsToCreate);

    return createdInvestments;
}

export async function modifyInvestment(id, { updateData, mode }) {
    const target = await investmentRepo.findById(id);

    if (!target) {
        throw new Error("INVESTMENT_NOT_FOUND");
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await investmentRepo.update(id, updateData);
    }

    switch (mode) {
        case 'ALL':
            const dataToUpdateAll = { ...updateData };
            delete dataToUpdateAll.dueDate;

            await investmentRepo.updateAllInSeries(target.seriesId, dataToUpdateAll);
            break;

        case 'FUTURE':
            const dataToUpdateFuture = { ...updateData };
            delete dataToUpdateFuture.dueDate;

            await investmentRepo.updateFutureInSeries(target.seriesId, target.dueDate, dataToUpdateFuture);
            break;

        case 'PAST':
            const dataToUpdatePast = { ...updateData };
            delete dataToUpdatePast.dueDate;

            await investmentRepo.updatePastInSeries(target.seriesId, target.dueDate, dataToUpdatePast);
            break;
    }

    return await investmentRepo.update(id, updateData);
}



export async function removeInvestment(id, mode = 'SINGLE') {
    const target = await investmentRepo.findById(id);

    if (!target) {
        throw new Error("INVESTMENT_NOT_FOUND");
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await investmentRepo.deleteById(id);
    }

    switch (mode) {
        case 'ALL':
            return await investmentRepo.deleteAllInSeries(target.seriesId);

        case 'FUTURE':
            return await investmentRepo.deleteFutureInSeries(target.seriesId, target.dueDate);

        case 'PAST':
            return await investmentRepo.deletePastInSeries(target.seriesId, target.dueDate);

        default:
            return await investmentRepo.deleteById(id);
    }
}