import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importe seus models e enums (Ajuste os caminhos conforme sua estrutura)
import { Expense } from "../src/models/expensesModels/Expense.js";
import { Gain } from "../src/models/gainsModels/Gain.js";
import { Investment } from "../src/models/investmentsModels/Investment.js";

import { expenseCategory } from "../src/models/expensesModels/expensesCategories.js";
import { gainsCategories } from '../src/models/gainsModels/gainsCategories.js';
import { investmentsCategories } from '../src/models/investmentsModels/investmentsCategories.js';
import { connectDB } from '../src/config/database.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/seu_banco';

// Frequências aceitas
const FREQ = {
    ONCE: 'apenas uma vez',
    MONTHLY: 'mensal',
    WEEKLY: 'semanal'
};

// Utilitário para gerar séries recorrentes mensais
function generateMonthlySeries({ name, amount, category, startDateStr, totalMonths, modelName }) {
    const seriesId = new mongoose.Types.ObjectId();
    const items = [];

    const start = new Date(startDateStr);
    const finish = new Date(start);
    finish.setUTCMonth(finish.getUTCMonth() + totalMonths - 1);

    for (let i = 0; i < totalMonths; i++) {
        const dueDate = new Date(start);
        dueDate.setUTCMonth(dueDate.getUTCMonth() + i);

        items.push({
            name,
            amount,
            category,
            frequency: FREQ.MONTHLY,
            seriesId,
            startDate: start,
            dueDate,
            finishDate: finish
        });
    }

    return items;
}

// Utilitário para itens pontuais
function generateSingleItem({ name, amount, category, dateStr }) {
    const dueDate = new Date(dateStr);
    return {
        name,
        amount,
        category,
        frequency: FREQ.ONCE,
        seriesId: null,
        startDate: dueDate,
        dueDate,
        finishDate: null
    };
}

async function seedDatabase() {
    try {
        console.log(' Conectando ao MongoDB...');
        await connectDB();

        console.log(' Limpando dados antigos...');
        await Promise.all([
            Expense.deleteMany({}),
            Gain.deleteMany({}),
            Investment.deleteMany({})
        ]);

        const currentYear = new Date().getUTCFullYear();

        // 1. DADOS DE GANHOS (Gains)
        console.log(' Gerando Ganhos...');
        const gainsData = [
            // Salário Recorrente (Janeiro a Dezembro)
            ...generateMonthlySeries({
                name: 'Salário Principal',
                amount: 8500,
                category: gainsCategories.SALARIO,
                startDateStr: `${currentYear}-01-05T00:00:00.000Z`,
                totalMonths: 12
            }),
            // Freelance pontual
            generateSingleItem({
                name: 'Projeto Website Cliente X',
                amount: 2500,
                category: gainsCategories.FREE_LANCE,
                dateStr: `${currentYear}-03-15T00:00:00.000Z`
            }),
            // Dividendo pontual
            generateSingleItem({
                name: 'Rendimentos FIIs',
                amount: 320,
                category: gainsCategories.DIVIDENDOS,
                dateStr: `${currentYear}-06-10T00:00:00.000Z`
            })
        ];

        // 2. DADOS DE DESPESAS (Expenses)
        console.log(' Gerando Despesas...');
        const expensesData = [
            // Aluguel/Financiamento (Mensal)
            ...generateMonthlySeries({
                name: 'Aluguel do Apartamento',
                amount: 2200,
                category: expenseCategory.HABITCAO,
                startDateStr: `${currentYear}-01-10T00:00:00.000Z`,
                totalMonths: 12
            }),
            // Academia (Mensal de Março a Dezembro)
            ...generateMonthlySeries({
                name: 'Mensalidade Academia',
                amount: 120,
                category: expenseCategory.SAUDE,
                startDateStr: `${currentYear}-03-01T00:00:00.000Z`,
                totalMonths: 10
            }),
            // Compras pontuais
            generateSingleItem({
                name: 'Supermercado Mensal',
                amount: 1450,
                category: expenseCategory.ALIMENTACAO,
                dateStr: `${currentYear}-08-05T00:00:00.000Z`
            }),
            generateSingleItem({
                name: 'Manutenção Carro',
                amount: 780,
                category: expenseCategory.TRANSPORTE,
                dateStr: `${currentYear}-05-20T00:00:00.000Z`
            }),
            generateSingleItem({
                name: 'Jantar Aniversário',
                amount: 350,
                category: expenseCategory.LAZER,
                dateStr: `${currentYear}-07-12T00:00:00.000Z`
            })
        ];

        // 3. DADOS DE INVESTIMENTOS (Investments)
        console.log(' Gerando Investimentos...');
        const investmentsData = [
            // Aporte Mensal no Tesouro Direto
            ...generateMonthlySeries({
                name: 'Aporte Tesouro IPCA+',
                amount: 1000,
                category: investmentsCategories.TESOURO_DIRETO,
                startDateStr: `${currentYear}-01-20T00:00:00.000Z`,
                totalMonths: 12
            }),
            // Aporte pontual em Cripto
            generateSingleItem({
                name: 'Compra Bitcoin',
                amount: 500,
                category: investmentsCategories.CRIPTOATIVOS,
                dateStr: `${currentYear}-04-18T00:00:00.000Z`
            }),
            // Aporte pontual em Ações
            generateSingleItem({
                name: 'Lote Ações B3',
                amount: 1500,
                category: investmentsCategories.ACOES,
                dateStr: `${currentYear}-08-02T00:00:00.000Z`
            })
        ];

        // Inserção no banco
        await Gain.insertMany(gainsData);
        await Expense.insertMany(expensesData);
        await Investment.insertMany(investmentsData);

        console.log(' Banco de dados populado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error(' Erro ao popular o banco de dados:', error);
        process.exit(1);
    }
}

seedDatabase();