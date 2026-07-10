export function normalizeDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

export function isoDateToBrazilianDate(isoDate) {
    return isoDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}