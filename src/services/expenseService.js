import mongoose from "mongoose";
import * as repo from "../repositories/expenseRepository.js";
import * as categoryRepo from "../repositories/categoryRepository.js";

import { normalizeDate, normalizeDateToCurrentDate } from "../utils/normalizeDate.js";
import { normalizeMode } from "../utils/normalizeMode.js"
import { generateRecurrentSeries } from "../utils/generateRecurrentSeries.js";
import { calculateNextDate } from "../utils/calculateNextDate.js";

import { frequency } from "../models/frequencyEnum.js";

export async function create(data) {
    if (!data.category) {
        throw new Error("CATEGORY_REQUIRED");
    }

    const categoryDoc = await categoryRepo.findByIdOrNameAndType(data.category, "expense");

    if (!categoryDoc) {
        throw new Error("INVALID_CATEGORY");
    }

    const categoryId = categoryDoc._id;

    const isRecurrent =
        data.frequency &&
        data.frequency !== frequency.ONCE &&
        data.frequency !== "ONCE" &&
        data.frequency !== "apenas uma vez";

    if (!isRecurrent) {
        const createdExpense = await repo.createSingle({
            ...data,
            category: categoryId,
            seriesId: null
        });

        return await createdExpense.populate("category");
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

    const expensesToCreate = generateRecurrentSeries({
        baseData: {
            name: data.name,
            amount: data.amount,
            category: categoryId,
        },
        seriesId,
        startDate,
        dueDate,
        finishDate,
        newFrequency: data.frequency,
    });

    await repo.createMany(expensesToCreate);

    return await repo.findBySeries(seriesId);
}

export async function getByMonth(year, month) {
    const { year: finalYear, month: finalMonth } = normalizeDateToCurrentDate(year, month);

    if (isNaN(finalYear) || isNaN(finalMonth) || finalMonth < 1 || finalMonth > 12) {
        throw new Error("INVALID_DATE_PARAMETERS");
    }

    return await repo.findByMonth(finalYear, finalMonth);
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

export async function getByCategoryAndMonth(categoryId, year, month) {
    const { year: finalYear, month: finalMonth } = normalizeDateToCurrentDate(year, month);

    if (isNaN(finalYear) || isNaN(finalMonth) || finalMonth < 1 || finalMonth > 12) {
        throw new Error("INVALID_DATE_PARAMETERS");
    }

    if (!categoryId) {
        throw new Error("CATEGORY_REQUIRED");
    }

    // Busca a categoria tanto por ObjectId quanto pelo Nome ("transporte", "moradia", etc.)
    const categoryDoc = await categoryRepo.findByIdOrNameAndType(categoryId, "expense");

    if (!categoryDoc) {
        throw new Error("INVALID_CATEGORY");
    }

    // Passa o ObjectId real (categoryDoc._id) para o repositório de despesas
    return await repo.findByCategoryAndMonth(categoryDoc._id, finalYear, finalMonth);
}

export async function removeExpense(id, mode) {
    const target = await repo.findById(id);
    const normalizedMode = normalizeMode(mode);

    if (!target) {
        throw new Error("EXPENSE_NOT_FOUND");
    }

    if (!target.seriesId || normalizedMode === 'SINGLE') {
        return await repo.deleteById(id);
    }

    switch (normalizedMode) {
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

export async function modifyExpense(id, { updateData, mode }) {
    const target = await repo.findById(id);

    if (!target) {
        throw new Error("EXPENSE_NOT_FOUND");
    }

    if (updateData.category) {
        const categoryDoc = await categoryRepo.findByIdOrNameAndType(updateData.category, "expense");
        if (!categoryDoc) {
            throw new Error("INVALID_CATEGORY");
        }
        updateData.category = categoryDoc._id;
    }

    const normalizedMode = normalizeMode(mode);

    const isTargetOnce = target.frequency === frequency.ONCE || target.frequency === 'ONCE';
    const isNewOnce = updateData.frequency ? (updateData.frequency === frequency.ONCE || updateData.frequency === 'ONCE') : isTargetOnce;
    const frequencyChanged = updateData.frequency && updateData.frequency !== target.frequency;
    const targetCategoryId = target.category._id ? target.category._id : target.category;

    const mergedData = {
        name: updateData.name ?? target.name,
        amount: updateData.amount ?? target.amount,
        category: updateData.category ?? targetCategoryId,
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

        const expensesToCreate = generateRecurrentSeries({
            baseData: mergedData,
            seriesId: newSeriesId,
            startDate: mergedData.startDate,
            dueDate: mergedData.dueDate,
            finishDate: mergedData.finishDate,
            newFrequency: mergedData.frequency
        });

        await repo.createMany(expensesToCreate);
        return await repo.findBySeries(newSeriesId);
    }
    if (frequencyChanged && target.seriesId) {
        switch (normalizedMode) {
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

                await repo.createMany(items);
                return await repo.findBySeries(target.seriesId);
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
                await repo.createMany(items);
                return await repo.findBySeries(target.seriesId, target.dueDate);
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
                await repo.createMany(items);
                return await repo.findBySeries(target.seriesId);
            }

            case 'SINGLE':
            default: {
                const updated = await repo.update(id, {
                    ...updateData,
                    seriesId: isNewOnce ? null : new mongoose.Types.ObjectId()
                });
                return await updated?.populate("category");
            }
        }
    }
    if (!target.seriesId || normalizedMode === 'SINGLE') {
        const updated = await repo.update(id, updateData);
        return await updated?.populate("category");
    }
    switch (normalizedMode) {
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

            await repo.createMany(items);
            return await repo.findBySeries(target.seriesId);
        }

        case 'FUTURE':
            await repo.updateFutureInSeries(target.seriesId, target.dueDate, updateData);
            return await repo.findBySeries(target.seriesId, target.dueDate);

        case 'PAST':
            await repo.updatePastInSeries(target.seriesId, target.dueDate, updateData);
            return await repo.findBySeries(target.seriesId);

        default: {
            const updated = await repo.update(id, updateData);
            return await updated?.populate("category");
        }
    }
}