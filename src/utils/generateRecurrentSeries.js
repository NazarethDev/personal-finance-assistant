import { calculateNextDate } from "./calculateNextDate.js";

export function generateRecurrentSeries({ baseData, seriesId, startDate, dueDate, finishDate, newFrequency }) {
    const recordsToCreate = [];
    let currentDueDate = new Date(dueDate);
    const start = new Date(startDate);
    const endLimit = finishDate ? new Date(finishDate) : null;

    let limitDate = endLimit ? new Date(endLimit) : new Date(start);
    if (!endLimit) {
        limitDate.setUTCFullYear(limitDate.getUTCFullYear() + 1);
    }

    while (currentDueDate <= limitDate) {
        recordsToCreate.push({
            ...baseData,
            frequency: newFrequency,
            seriesId: seriesId,
            dueDate: new Date(currentDueDate),
            startDate: start,
            finishDate: endLimit ? new Date(endLimit) : null
        });

        currentDueDate = calculateNextDate(currentDueDate, newFrequency);
    }

    return recordsToCreate;
}