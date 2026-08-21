import { getAllRates } from "../services/currencyServices/exchangeRateService.js";

const DEFAULT_CURRENCIES = new Set([
    'BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ARS'
]);

export function normalizeCurrency(currency, preferredCurrency = 'BRL') {
    const defaultFallback = (preferredCurrency && typeof preferredCurrency === 'string')
        ? preferredCurrency.trim().toUpperCase()
        : 'BRL';

    if (!currency || typeof currency !== 'string') {
        return defaultFallback;
    }

    const cleaned = currency.trim().toUpperCase();

    const stored = getAllRates();
    if (stored && stored.rates && Object.keys(stored.rates).length > 0) {
        if (stored.rates[cleaned]) return cleaned;
    }

    if (DEFAULT_CURRENCIES.has(cleaned)) {
        return cleaned;
    }

    return defaultFallback;
}