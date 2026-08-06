import mongoose from "mongoose";
import * as repo from "../repositories/investmentRepository.js";

import { normalizeDate } from "../utils/normalizeDate.js";
import { calculateNextDate } from "../utils/calculateNextDate.js";
import { generateRecurrentSeries } from "../utils/generateRecurrentSeries.js";
import { normalizeMode } from "../utils/normalizeMode.js";

import { frequency } from "../models/frequencyEnum.js";
import { investmentsCategories } from "../models/investmentsModels/investmentsCategories.js";

export async function create(data) {
    const isRecurrent =
        data.frequency &&
        data.frequency !== frequency.ONCE &&
        data.frequency !== "ONCE" &&
        data.frequency !== "apenas uma vez";


    if (!isRecurrent) {
        return await repo.createSingle({
            ...data,
            seriesId: null
        });
    }

    const dueDate = data.dueDate
        ? normalizeDate(data.dueDate)
        : normalizeDate(new Date());

    const startDate = data.startDate
        ? normalizeDate(data.startDate)
        : normalizeDate(new Date());

    const finishDate = data.finishDate
        ? normalizeDate(data.finishDate)
        : calculateNextDate(startDate, frequency.YEARLY);

    const seriesId = new mongoose.Types.ObjectId();

    const investmentsToCreate = generateRecurrentSeries({
        baseData: {
            name: data.name,
            amount: data.amount,
            category: data.category,
        },
        seriesId,
        startDate,
        dueDate: data.dueDate,
        finishDate,
        newFrequency: data.frequency,
    });

    return await repo.createMany(investmentsToCreate);
}


export async function getByMonth(year, month) {
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);

    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        throw new Error("INVALID_DATE_PARAMETERS");
    }

    return await repo.findByMonth(parsedYear, parsedMonth);
}

export async function getBySeries(seriesId) {
    if (!seriesId) {
        throw new Error("SERIES_ID_REQUIRED");
    }

    const data = await repo.findBySeries(seriesId);

    if (!data || data.length === 0) {
        throw new Error("SERIES_NOT_FOUND");
    }

    return data;
}

export async function getByCategoryAndMonth(category, year, month) {
    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);

    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        throw new Error("INVALID_DATE_PARAMETERS");
    }

    const validCategories = Object.values(investmentsCategories);
    if (!category || !validCategories.includes(category)) {
        throw new Error("INVALID_CATEGORY");
    }

    return await repo.findByCategoryAndMonth(category, parsedYear, parsedMonth);
}

export async function modifyInvestment(id, { updateData, mode }) {
    const target = await repo.findById(id);
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
        await repo.deleteById(target._id);

        const investmentsToCreate = generateRecurrentSeries({
            baseData: mergedData,
            seriesId: newSeriesId,
            startDate: mergedData.startDate,
            dueDate: mergedData.dueDate,
            finishDate: mergedData.finishDate,
            newFrequency: mergedData.frequency
        });

        return await repo.createMany(investmentsToCreate);
    }

    if (frequencyChanged && target.seriesId) {
        switch (mode) {
            case 'ALL': {
                const currentSeries = await repo.findBySeries(target.seriesId);

                const firstItem = currentSeries[0] || target;

                const seriesStartDate = updateData.startDate ? new Date(updateData.startDate) : firstItem.startDate;
                const seriesDueDate = updateData.dueDate ? new Date(updateData.dueDate) : firstItem.dueDate;

                await repo.deleteAllInSeries(target.seriesId);

                const items = generateRecurrentSeries({
                    baseData: mergedData,
                    seriesId: target.seriesId,
                    startDate: seriesStartDate,
                    dueDate: seriesDueDate,
                    finishDate: mergedData.finishDate,
                    newFrequency: mergedData.frequency
                });

                return await repo.createMany(items);
            }

            case 'FUTURE': {
                await repo.deleteFutureInSeries(target.seriesId, target.dueDate);

                const items = generateRecurrentSeries({
                    baseData: mergedData,
                    seriesId: target.seriesId,
                    startDate: target.dueDate,
                    dueDate: target.dueDate,
                    finishDate: mergedData.finishDate,
                    newFrequency: mergedData.frequency
                });
                return await repo.createMany(items);
            }

            case 'PAST': {
                await repo.deletePastInSeries(target.seriesId, target.dueDate);

                const items = generateRecurrentSeries({
                    baseData: mergedData,
                    seriesId: target.seriesId,
                    startDate: mergedData.startDate,
                    dueDate: mergedData.startDate,
                    finishDate: target.dueDate,
                    newFrequency: mergedData.frequency
                });
                return await repo.createMany(items);
            }

            case 'SINGLE':
            default: {
                return await repo.update(id, {
                    ...updateData,
                    seriesId: isNewOnce ? null : new mongoose.Types.ObjectId()
                });
            }
        }
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await repo.update(id, updateData);
    }

    switch (mode) {
        case 'ALL': {
            const currentSeries = await repo.findBySeries(target.seriesId);
            const firstItem = currentSeries[0] || target;
            const lastItem = currentSeries[currentSeries.length - 1] || target;

            const seriesStartDate = updateData.startDate ? new Date(updateData.startDate) : firstItem.startDate;
            const seriesDueDate = updateData.dueDate ? new Date(updateData.dueDate) : firstItem.dueDate;
            const seriesFinishDate = updateData.finishDate !== undefined
                ? (updateData.finishDate ? new Date(updateData.finishDate) : null)
                : (lastItem.finishDate ? new Date(lastItem.finishDate) : null);

            await repo.deleteAllInSeries(target.seriesId);

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

            return await repo.createMany(items);
        }
        case 'FUTURE':
            await repo.updateFutureInSeries(target.seriesId, target.dueDate, updateData);
            return await repo.findBySeries(target.seriesId, target.dueDate);

        case 'PAST':
            await repo.updatePastInSeries(target.seriesId, target.dueDate, updateData);
            return await repo.findBySeries(target.seriesId);

        default:
            return await repo.update(id, updateData);
    }
}

export async function removeInvestment(id, mode) {
    const target = await repo.findById(id);
    mode = normalizeMode(mode);

    if (!target) {
        throw new Error("INVESTMENT_NOT_FOUND");
    }

    if (!target.seriesId || mode === 'SINGLE') {
        return await repo.deleteById(id);
    }

    switch (mode) {
        case 'ALL':
            return await repo.deleteAllInSeries(target.seriesId);

        case 'FUTURE':
            return await repo.deleteFutureInSeries(target.seriesId, target.dueDate);

        case 'PAST':
            return await repo.deletePastInSeries(target.seriesId, target.dueDate);

        default:
            return await repo.deleteById(id);
    }
}