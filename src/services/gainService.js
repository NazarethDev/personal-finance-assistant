import mongoose from "mongoose";
import * as gainRepo from "../repositories/gainRepository.js";

import { normalizeDate } from "../utils/normalizeDate.js";
import { normalizeMode } from "../utils/normalizeMode.js";
import { calculateNextDate } from "../utils/calculateNextDate.js";
import { frequency } from "../models/frequencyEnum.js"
import { generateRecurrentSeries } from "../utils/generateRecurrentSeries.js";

export async function create(data) {
    const isRecurrent = data.frequency &&
        data.frequency !== frequency.ONCE &&
        data.frequency !== 'ONCE';

    if (!isRecurrent) {
        return await gainRepo.createSingle({
            ...data,
            seriesId: null
        });
    }

    const seriesId = new mongoose.Types.ObjectId();

    const gainsToCreate = generateRecurrentSeries({
        baseData: {
            name: data.name,
            amount: data.amount,
            category: data.category,
        },
        seriesId,
        startDate: data.startDate,
        dueDate: data.dueDate,
        finishDate: data.finishDate,
        newFrequency: data.frequency,
    });

    const createdGains = await gainRepo.createMany(gainsToCreate);

    return createdGains;
}

export async function modifyGain(id, { updateData, mode }) {
    const target = await gainRepo.findById(id);
    mode = normalizeMode(mode);

    if (!target) {
        throw new Error("GAIN_NOT_FOUND");
    }

    const isTargetOnce = target.frequency === frequency.ONCE || target.frequency === 'ONCE';
    const isNewOnce = updateData.frequency ? (updateData.frequency === frequency.ONCE || updateData.frequency === 'ONCE') : isTargetOnce;
    const frequencyChanged = updateData.frequency && updateData.frequency !== target.frequency;

    const mergedData = {
        name: updateData.name ?? target.name,
        amount: updateData.amount ?? target.amount,
        category: updateData.category ?? target.category,
        frequency: updateData.frequency ?? target.frequency,
        startDate: updateData.startDate ? new Date(updateData.startDate) : target.startDate,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : target.dueDate,
        finishDate: updateData.finishDate !== undefined
            ? (updateData.finishDate ? new Date(updateData.finishDate) : null)
            : target.finishDate
    };

    if (isTargetOnce && !isNewOnce) {
        const newSeriesId = new mongoose.Types.ObjectId();
        await gainRepo.deleteById(target._id);

        const gainsToCreate = generateRecurrentSeries({
            baseData: mergedData,
            seriesId: newSeriesId,
            startDate: mergedData.startDate,
            dueDate: mergedData.dueDate,
            finishDate: mergedData.finishDate,
            newFrequency: mergedData.frequency
        });

        return await gainRepo.createMany(gainsToCreate);
    }

    if (frequencyChanged && target.seriesId) {
        switch (mode) {
            case 'ALL': {
                const currentSeries = await gainsToCreate.findBySeries(target.seriesId);

                const firstItem = currentSeries[0] || target;

                const seriesStartDate = updateData.startDate ? new Date(updateData.startDate) : firstItem.startDate;
                const seriesDueDate = updateData.dueDate ? new Date(updateData.dueDate) : firstItem.dueDate;

                await gainRepo.deleteAllInSeries(target.seriesId);

                const items = generateRecurrentSeries({
                    baseData: mergedData,
                    seriesId: target.seriesId,
                    startDate: seriesStartDate,
                    dueDate: seriesDueDate,
                    finishDate: mergedData.finishDate,
                    newFrequency: mergedData.frequency
                });

                return await gainRepo.createMany(items);
            }

            case 'FUTURE': {
                await gainRepo.deleteFutureInSeries(target.seriesId, target.dueDate);

                const items = generateRecurrentSeries({
                    baseData: mergedData,
                    seriesId: target.seriesId,
                    startDate: target.dueDate,
                    dueDate: target.dueDate,
                    finishDate: mergedData.finishDate,
                    newFrequency: mergedData.frequency
                });
                return await gainRepo.createMany(items);
            }

            case 'PAST': {
                await gainRepo.deletePastInSeries(target.seriesId, target.dueDate);

                const items = generateRecurrentSeries({
                    baseData: mergedData,
                    seriesId: target.seriesId,
                    startDate: mergedData.startDate,
                    dueDate: mergedData.startDate,
                    finishDate: target.dueDate,
                    newFrequency: mergedData.frequency
                });
                return await gainRepo.createMany(items);
            }

            case 'SINGLE':
            default: {
                return await gainRepo.update(id, {
                    ...updateData,
                    seriesId: isNewOnce ? null : new mongoose.Types.ObjectId()
                });
            }
        }
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await gainRepo.update(id, updateData);
    }

    switch (mode) {
        case 'ALL': {
            const currentSeries = await gainRepo.findBySeries(target.seriesId);
            const firstItem = currentSeries[0] || target;
            const lastItem = currentSeries[currentSeries.length - 1] || target;

            const seriesStartDate = updateData.startDate ? new Date(updateData.startDate) : firstItem.startDate;
            const seriesDueDate = updateData.dueDate ? new Date(updateData.dueDate) : firstItem.dueDate;
            const seriesFinishDate = updateData.finishDate !== undefined
                ? (updateData.finishDate ? new Date(updateData.finishDate) : null)
                : (lastItem.finishDate ? new Date(lastItem.finishDate) : null);

            await gainRepo.deleteAllInSeries(target.seriesId);

            const items = generateRecurrentSeries({
                baseData: {
                    ...mergedData,
                    finishDate: seriesFinishDate
                },
                seriesId: target.seriesId,
                startDate: seriesStartDate,
                dueDate: seriesDueDate,
                finishDate: seriesFinishDate,
                newFrequency: mergedData.frequency
            });

            return await gainRepo.createMany(items);
        }
        case 'FUTURE':
            await gainRepo.updateFutureInSeries(target.seriesId, target.dueDate, updateData);
            return await gainRepo.findBySeries(target.seriesId, target.dueDate);

        case 'PAST':
            await gainRepo.updatePastInSeries(target.seriesId, target.dueDate, updateData);
            return await gainRepo.findBySeries(target.seriesId);

        default:
            return await gainRepo.update(id, updateData);
    }
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