import axios from 'axios';

export const fetchExternalRates = async (baseCurrency = 'USD') => {
    try {
        const url = `https://open.er-api.com/v6/latest/${baseCurrency}`;
        const response = await axios.get(url);

        if (response.data && response.data.result === 'success') {
            return response.data.rates; // Retorna { USD: 1, BRL: 5.05, EUR: 0.92, JPY: 155.2 ... }
        }

        throw new Error('Resposta inválida da API de Câmbio');
    } catch (error) {
        console.error('[ExchangeRate Controller] Erro na requisição externa:', error.message);
        throw error;
    }
};