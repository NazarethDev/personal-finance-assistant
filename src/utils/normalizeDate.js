export function normalizeDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

export function isoDateToBrazilianDate(isoDate) {
    return isoDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function normalizeDateToCurrentDate(year, month) {
    const useDate = new Date();

    const parsedYear = year ? parseInt(year, 10) : useDate.getUTCFullYear();
    const parsedMonth = month ? parseInt(month, 10) : (useDate.getUTCMonth() + 1);

    return { year: parsedYear, month: parsedMonth };
}