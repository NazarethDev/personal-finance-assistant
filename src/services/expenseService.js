import mongoose from "mongoose";
import * as expenseRepo from "../repositories/expenseRepository.js";

import { normalizeDate } from "../utils/normalizeDate.js";
import { calculateNextDate } from "../utils/calculateNextDate.js";
import { frequency } from "../models/frequencyEnum.js";

export async function create(data) {
    const isRecurrent = data.frequency &&
        data.frequency !== frequency.ONCE &&
        data.frequency !== 'ONCE';

    if (!isRecurrent) {
        return await expenseRepo.createSingle({
            ...data,
            seriesId: null
        });
    }

    const seriesId = new mongoose.Types.ObjectId();
    const expensesToCreate = [];

    let currentDueDate = new Date(data.dueDate);
    const startDate = new Date(data.startDate);

    let limitDate = data.finishDate ? new Date(data.finishDate) : new Date(startDate);
    if (!data.finishDate) {
        limitDate.setUTCFullYear(limitDate.getUTCFullYear() + 1);
    }

    while (currentDueDate <= limitDate) {
        expensesToCreate.push({
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

    const createdExpenses = await expenseRepo.createMany(expensesToCreate);

    return createdExpenses;
}

export async function modifyExpense(id, { updateData, mode }) {
    const target = await expenseRepo.findById(id);

    if (!target) {
        throw new Error("EXPENSE_NOT_FOUND");
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await expenseRepo.update(id, updateData);
    }

    switch (mode) {
        case 'ALL':
            const dataToUpdateAll = { ...updateData };
            delete dataToUpdateAll.dueDate;

            await expenseRepo.updateAllInSeries(target.seriesId, dataToUpdateAll);
            break;

        case 'FUTURE':
            const dataToUpdateFuture = { ...updateData };
            delete dataToUpdateFuture.dueDate;

            await expenseRepo.updateFutureInSeries(target.seriesId, target.dueDate, dataToUpdateFuture);
            break;

        case 'PAST':
            const dataToUpdatePast = { ...updateData };
            delete dataToUpdatePast.dueDate;

            await expenseRepo.updatePastInSeries(target.seriesId, target.dueDate, dataToUpdatePast);
            break;
    }

    return await expenseRepo.update(id, updateData);
}

export async function removeExpense(id, mode = 'SINGLE') {
    const target = await expenseRepo.findById(id);

    if (!target) {
        throw new Error("EXPENSE_NOT_FOUND");
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await expenseRepo.deleteById(id);
    }

    switch (mode) {
        case 'ALL':
            return await expenseRepo.deleteAllInSeries(target.seriesId);

        case 'FUTURE':
            return await expenseRepo.deleteFutureInSeries(target.seriesId, target.dueDate);

        case 'PAST':
            return await expenseRepo.deletePastInSeries(target.seriesId, target.dueDate);

        default:
            return await expenseRepo.deleteById(id);
    }
}