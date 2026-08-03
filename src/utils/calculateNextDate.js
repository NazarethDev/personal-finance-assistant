import { frequency } from "../models/frequencyEnum.js";

export function calculateNextDate(currentDate, freq) {
    const next = new Date(currentDate);

    const isWeekly = freq === frequency.WEEKLY || freq === 'WEEKLY' || freq === 'semanal';
    const isMonthly = freq === frequency.MONTHLY || freq === 'MONTHLY' || freq === 'mensal';
    const isYearly = freq === frequency.YEARLY || freq === 'YEARLY' || freq === 'anual';

    if (isWeekly) {
        next.setUTCDate(next.getUTCDate() + 7);
    } else if (isMonthly) {
        next.setUTCMonth(next.getUTCMonth() + 1);
    } else if (isYearly) {
        next.setUTCFullYear(next.getUTCFullYear() + 1);
    }

    return next;
}