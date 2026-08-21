import { fetchExternalRates } from "../../controllers/exchangeRateController.js";
import { updateStoredRates } from "./exchangeRateService.js";

let cronIntervalId = null;

export const syncRates = async () => {
    try {
        const rawRates = await fetchExternalRates('USD');

        updateStoredRates(rawRates);
    } catch (error) {
        console.error('[RateCron Service] Erro ao sincronizar taxas:', error.message);
    }
};


export const startRatesCron = (intervalMinutes = 60) => {
    console.log(`[RateCron Service] Agendador iniciado. Intervalo: ${intervalMinutes} minutos.`);

    syncRates();

    const intervalMs = intervalMinutes * 60 * 1000;
    cronIntervalId = setInterval(() => {
        syncRates();
    }, intervalMs);
};

export const stopRatesCron = () => {
    if (cronIntervalId) {
        clearInterval(cronIntervalId);
        console.log('[RateCron Service] Agendador interrompido.');
    }
};