import { fetchAllFinancialDataInSingleQuery } from "../repositories/analyticsRepository.js";

const CATEGORY_GROUPS = {
    NEEDS: ['habitação', 'transporte', 'saúde', 'educação', 'alimentação', 'impostos', 'seguros'],
    WANTS: ['lazer', 'entretenimento', 'cuidados pessoais', 'presentes'],
    FUTURE_DEBTS: ['investimentos', 'emprestimos', 'cartões de crédito', 'faturas', 'outros']
};

export const getDashboardAnalytics = async (currentStart, currentEnd, previousStart, previousEnd) => {
    // Busca dados do mês atual e do mês anterior em paralelo no MongoDB
    const [currentData, previousData] = await Promise.all([
        fetchAllFinancialDataInSingleQuery(currentStart, currentEnd),
        fetchAllFinancialDataInSingleQuery(previousStart, previousEnd)
    ]);

    // Totais Mês Atual
    const totalGains = currentData.gains.reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = currentData.expenses.reduce((acc, i) => acc + i.amount, 0);
    const totalInvestments = currentData.investments.reduce((acc, i) => acc + i.amount, 0);

    // Totais Mês Anterior (Para Comparativo)
    const prevGains = previousData.gains.reduce((acc, i) => acc + i.amount, 0);
    const prevExpenses = previousData.expenses.reduce((acc, i) => acc + i.amount, 0);
    const prevInvestments = previousData.investments.reduce((acc, i) => acc + i.amount, 0);

    // 1. Balanço Líquido e Taxa de Aporte
    const netBalance = totalGains - (totalExpenses + totalInvestments);
    const savingsRate = totalGains > 0 ? Number(((totalInvestments / totalGains) * 100).toFixed(2)) : 0;

    // 2. Taxa de Comprometimento de Renda (Despesas Recorrentes vs Receitas Recorrentes)
    const recurringGains = currentData.gains.filter(g => g.frequency && g.frequency !== 'SINGLE').reduce((s, g) => s + g.amount, 0);
    const recurringExpenses = currentData.expenses.filter(e => e.frequency && e.frequency !== 'SINGLE').reduce((s, e) => s + e.amount, 0);
    const commitmentRate = recurringGains > 0 ? Number(((recurringExpenses / recurringGains) * 100).toFixed(2)) : 0;

    // 3. Categorias de Despesas e Regra 50/30/20
    const expensesByCategory = {};
    const ruleTotals = { needs: 0, wants: 0, futureDebts: 0 };

    currentData.expenses.forEach(exp => {
        expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;

        if (CATEGORY_GROUPS.NEEDS.includes(exp.category)) ruleTotals.needs += exp.amount;
        else if (CATEGORY_GROUPS.WANTS.includes(exp.category)) ruleTotals.wants += exp.amount;
        else ruleTotals.futureDebts += exp.amount;
    });

    // 4. Rastreamento de Dívidas / Empréstimos / Cartões
    const debtCategories = ['emprestimos', 'cartões de crédito', 'faturas'];
    const debtExpenses = currentData.expenses.filter(e => debtCategories.includes(e.category));
    const totalDebts = debtExpenses.reduce((s, d) => s + d.amount, 0);

    // 5. Distribuição de Investimentos
    const investmentsByCategory = {};
    currentData.investments.forEach(inv => {
        investmentsByCategory[inv.category] = (investmentsByCategory[inv.category] || 0) + inv.amount;
    });

    // 6. Comparativo Percentual (Delta Mês Anterior)
    const comparative = {
        gainsChange: calcDelta(prevGains, totalGains),
        expensesChange: calcDelta(prevExpenses, totalExpenses),
        investmentsChange: calcDelta(prevInvestments, totalInvestments)
    };

    return {
        overview: {
            totalGains,
            totalExpenses,
            totalInvestments,
            netBalance,
            savingsRate,
            commitmentRate // Taxa de Comprometimento de Renda (%)
        },
        comparative,
        rule50_30_20: {
            needs: { amount: ruleTotals.needs, percentage: calcPct(ruleTotals.needs, totalGains) },
            wants: { amount: ruleTotals.wants, percentage: calcPct(ruleTotals.wants, totalGains) },
            futureDebts: { amount: ruleTotals.futureDebts, percentage: calcPct(ruleTotals.futureDebts, totalGains) }
        },
        expensesByCategory,
        investmentsByCategory,
        debtTracker: {
            totalDebts,
            items: debtExpenses.map(d => ({ name: d.name, amount: d.amount, category: d.category, seriesId: d.seriesId }))
        }
    };
};

const calcDelta = (prev, curr) => prev === 0 ? (curr > 0 ? 100 : 0) : Number((((curr - prev) / Math.abs(prev)) * 100).toFixed(2));
const calcPct = (amount, total) => total > 0 ? Number(((amount / total) * 100).toFixed(2)) : 0;


export const getCalendarData = async (startDateStr, endDateStr) => {
    // 1. Busca os registros do mês
    const { gains, expenses, investments } = await fetchAllFinancialDataInSingleQuery(startDateStr, endDateStr);

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