let ratesMap = {};
let lastUpdated = null;

export const updateStoredRates = (newRates) => {
    ratesMap = { ...newRates };
    lastUpdated = new Date();
    console.log(`[RateStore Service] Taxas atualizadas em memória às ${lastUpdated.toISOString()}`);
};

export const getConversionFactor = (pair) => {
    if (!pair || typeof pair !== 'string') return null;

    const [from, to] = pair.toUpperCase().split('_');

    if (!from || !to) return null;
    if (from === to) return 1.0;

    const rateFrom = from === 'USD' ? 1.0 : ratesMap[from];
    const rateTo = to === 'USD' ? 1.0 : ratesMap[to];

    if (rateFrom && rateTo) {
        const factor = (1 / rateFrom) * rateTo;
        return Number(factor.toFixed(6));
    }

    return null;
};

export const getAllRates = () => {
    return {
        rates: ratesMap,
        lastUpdated
    };
};

export const calculateConvertedAmount = (amount, baseCurrency, targetCurrency) => {
    if (!amount || typeof amount !== 'number') return 0;

    const base = (baseCurrency || 'BRL').toUpperCase();
    const target = (targetCurrency || 'BRL').toUpperCase();

    if (base === target) {
        return Number(amount.toFixed(2));
    }

    const pair = `${base}_${target}`;
    const factor = getConversionFactor(pair);

    if (!factor) {
        return null;
    }

    return Number((amount * factor).toFixed(2));
};