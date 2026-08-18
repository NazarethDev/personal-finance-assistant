import { fetchAllFinancialDataInSingleQuery } from "../repositories/analyticsRepository.js";

const getCategoryName = (doc) => {
    if (!doc.category) return 'Sem Categoria';
    if (typeof doc.category === 'object' && doc.category.name) {
        return doc.category.name;
    }
    return 'Sem Categoria';
};

export const getDashboardAnalytics = async (userId, currentStart, currentEnd, previousStart, previousEnd) => {
    // Busca dados do mês atual e anterior
    const [currentData, previousData] = await Promise.all([
        fetchAllFinancialDataInSingleQuery(userId, currentStart, currentEnd),
        fetchAllFinancialDataInSingleQuery(userId, previousStart, previousEnd)
    ]);

    // 1. Totais do Mês Atual
    const totalGains = currentData.gains.reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = currentData.expenses.reduce((acc, i) => acc + i.amount, 0);
    const totalInvestments = currentData.investments.reduce((acc, i) => acc + i.amount, 0);

    // 2. Totais do Mês Anterior
    const prevGains = previousData.gains.reduce((acc, i) => acc + i.amount, 0);
    const prevExpenses = previousData.expenses.reduce((acc, i) => acc + i.amount, 0);
    const prevInvestments = previousData.investments.reduce((acc, i) => acc + i.amount, 0);

    // 3. Indicadores Financeiros Básicos
    const totalOutflows = totalExpenses + totalInvestments;
    const netBalance = totalGains - totalOutflows;

    // Taxa de Aporte / Poupança (% das receitas destinadas a investimentos)
    const savingsRate = totalGains > 0 ? Number(((totalInvestments / totalGains) * 100).toFixed(2)) : 0;

    // 4. Análise de Gastos Fixos vs. Variáveis (baseado no atributo 'frequency')
    let fixedExpenses = 0;
    let variableExpenses = 0;

    currentData.expenses.forEach(exp => {
        const isRecurring = exp.frequency && exp.frequency !== 'SINGLE' && exp.frequency !== 'ONCE';
        if (isRecurring) {
            fixedExpenses += exp.amount;
        } else {
            variableExpenses += exp.amount;
        }
    });

    const fixedPercentage = totalExpenses > 0 ? Number(((fixedExpenses / totalExpenses) * 100).toFixed(2)) : 0;
    const variablePercentage = totalExpenses > 0 ? Number(((variableExpenses / totalExpenses) * 100).toFixed(2)) : 0;

    // 5. Comprometimento da Renda Fixa (Despesas Recorrentes vs Receitas Recorrentes)
    const recurringGains = currentData.gains
        .filter(g => g.frequency && g.frequency !== 'SINGLE' && g.frequency !== 'ONCE')
        .reduce((s, g) => s + g.amount, 0);

    const commitmentRate = recurringGains > 0
        ? Number(((fixedExpenses / recurringGains) * 100).toFixed(2))
        : 0;

    // 6. Distribuição Real de Despesas por Categoria (com % sobre o total)
    const expensesByCategoryMap = {};
    currentData.expenses.forEach(exp => {
        const catName = getCategoryName(exp);
        expensesByCategoryMap[catName] = (expensesByCategoryMap[catName] || 0) + exp.amount;
    });

    const expensesByCategory = Object.entries(expensesByCategoryMap)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: calcPct(amount, totalExpenses)
        }))
        .sort((a, b) => b.amount - a.amount); // Ordena do maior para o menor

    // Maior Ofensor (Categoria com maior gasto no mês)
    const topExpenseCategory = expensesByCategory.length > 0 ? expensesByCategory[0] : null;

    // 7. Distribuição Real de Investimentos por Categoria
    const investmentsByCategoryMap = {};
    currentData.investments.forEach(inv => {
        const catName = getCategoryName(inv);
        investmentsByCategoryMap[catName] = (investmentsByCategoryMap[catName] || 0) + inv.amount;
    });

    const investmentsByCategory = Object.entries(investmentsByCategoryMap)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: calcPct(amount, totalInvestments)
        }))
        .sort((a, b) => b.amount - a.amount);

    // 8. Ritmo de Gastos Diário (Burn Rate)
    const startDate = new Date(currentStart);
    const endDate = new Date(currentEnd);
    const now = new Date();

    // Determina quantos dias já se passaram no intervalo atual
    const effectiveEnd = now < endDate && now > startDate ? now : endDate;
    const daysElapsed = Math.max(1, Math.ceil((effectiveEnd - startDate) / (1000 * 60 * 60 * 24)));
    const dailyExpenseAverage = Number((totalExpenses / daysElapsed).toFixed(2));

    // 9. Comparativo Percentual (Delta em relação ao Mês Anterior)
    const comparative = {
        gainsChange: calcDelta(prevGains, totalGains),
        expensesChange: calcDelta(prevExpenses, totalExpenses),
        investmentsChange: calcDelta(prevInvestments, totalInvestments),
        netBalanceChange: calcDelta(prevGains - (prevExpenses + prevInvestments), netBalance)
    };

    return {
        overview: {
            totalGains,
            totalExpenses,
            totalInvestments,
            netBalance,
            savingsRate,      // % da renda investida
            commitmentRate   // % da renda recorrente comprometida com contas fixas
        },
        expenseStructure: {
            fixed: { amount: fixedExpenses, percentage: fixedPercentage },
            variable: { amount: variableExpenses, percentage: variablePercentage },
            dailyAverage: dailyExpenseAverage,
            topCategory: topExpenseCategory
        },
        comparative,
        expensesByCategory,
        investmentsByCategory
    };
};

const calcDelta = (prev, curr) => prev === 0 ? (curr > 0 ? 100 : 0) : Number((((curr - prev) / Math.abs(prev)) * 100).toFixed(2));
const calcPct = (amount, total) => total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0;


export const getCalendarData = async (userId, startDateStr, endDateStr) => {
    // 1. Busca os registros do mês
    const { gains, expenses, investments } = await fetchAllFinancialDataInSingleQuery(userId, startDateStr, endDateStr);

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    let runningBalance = 0;
    const calendarDays = {};

    // 2. Monta o Mapa do Calendário dia a dia
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        const currentDayStr = d.toISOString().split('T')[0];

        // Vencimentos do Dia
        const dayGains = gains.filter(g => new Date(g.dueDate).toISOString().split('T')[0] === currentDayStr);
        const dayExpenses = expenses.filter(e => new Date(e.dueDate).toISOString().split('T')[0] === currentDayStr);
        const dayInvestments = investments.filter(i => new Date(i.dueDate).toISOString().split('T')[0] === currentDayStr);

        const sumGains = dayGains.reduce((s, g) => s + g.amount, 0);
        const sumExpenses = dayExpenses.reduce((s, e) => s + e.amount, 0);
        const sumInvestments = dayInvestments.reduce((s, i) => s + i.amount, 0);

        // Saldo Projetado Acumulado do Dia
        runningBalance += sumGains - (sumExpenses + sumInvestments);

        // Preenche o objeto com a chave da data 'YYYY-MM-DD'
        calendarDays[currentDayStr] = {
            date: currentDayStr,
            dayGainsTotal: sumGains,
            dayExpensesTotal: sumExpenses,
            dayInvestmentsTotal: sumInvestments,
            accumulatedBalance: runningBalance,
            // Status para o Calendário no App
            status: runningBalance >= 0 ? "POSITIVE" : "NEGATIVE",
            hasEvents: (dayGains.length + dayExpenses.length + dayInvestments.length) > 0,
            // Lista resumida de contas a vencer no dia para o modal do calendário
            itemsDueToday: [
                ...dayGains.map(g => ({ id: g._id, name: g.name, amount: g.amount, type: 'GAIN', category: g.category })),
                ...dayExpenses.map(e => ({ id: e._id, name: e.name, amount: e.amount, type: 'EXPENSE', category: e.category })),
                ...dayInvestments.map(i => ({ id: i._id, name: i.name, amount: i.amount, type: 'INVESTMENT', category: i.category }))
            ]
        };
    }

    return {
        month: startDateStr.substring(0, 7), // Ex: "2026-08"
        days: calendarDays
    };
};