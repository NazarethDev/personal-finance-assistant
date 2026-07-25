import { frequency } from "../models/frequencyEnum.js";

export function calculateNextDate(currentDate, freq) {
    const next = new Date(currentDate);

    if (freq === frequency.WEEKLY || freq === 'WEEKLY') {
        next.setUTCDate(next.getUTCDate() + 7);
    } else if (freq === frequency.MONTHLY || freq === 'MONTHLY') {
        next.setUTCMonth(next.getUTCMonth() + 1);
    } else if (freq === frequency.YEARLY || freq === 'YEARLY') {
        next.setUTCFullYear(next.getUTCFullYear() + 1);
    }

    return next;
}