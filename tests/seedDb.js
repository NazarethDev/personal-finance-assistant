{/*import mongoose from "mongoose";
import { Category } from "./src/models/Category.js"; // Ajuste os caminhos de import se necessário
import { Expense } from "./src/models/expensesModels/Expense.js";
import { frequency } from "./src/constants/frequency.js";
import { generateRecurrentSeries } from "../src/utils/generateRecurrentSeries.js";
import { calculateNextDate } from "../src/utils/calculateNextDate.js";
import { connectDB } from "../src/config/database.js"

connectDB();

const initialCategories = [
    { name: "moradia", type: "expense" },
    { name: "alimentação", type: "expense" },
    { name: "transporte", type: "expense" },
    { name: "saúde", type: "expense" },
    { name: "lazer", type: "expense" },
    { name: "educação", type: "expense" },
    { name: "outros", type: "expense" },
    { name: "salário", type: "income" },
    { name: "investimentos", type: "income" }
];

async function seedDatabase() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        // 1. Limpa o banco de dados antes de inserir novos registros
        console.log("Clearing existing Categories and Expenses...");
        await Category.deleteMany({});
        await Expense.deleteMany({});

        // 2. Cria as categorias padrão e armazena em um mapa para fácil acesso pelo nome
        console.log("Seeding Categories...");
        const createdCategories = await Category.insertMany(initialCategories);

        const categoryMap = {};
        createdCategories.forEach((cat) => {
            categoryMap[cat.name] = cat._id;
        });

        console.log(`Created ${createdCategories.length} categories.`);

        // Data base de referência (primeiro dia do mês atual)
        const now = new Date();
        const baseDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

        // 3. Preparação das Despesas Simples (Single Expenses)
        const singleExpenses = [
            {
                name: "Supermercado Mensal",
                amount: 850.50,
                category: categoryMap["alimentação"],
                frequency: frequency.ONCE,
                seriesId: null,
                startDate: baseDate,
                dueDate: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 5)),
                finishDate: null
            },
            {
                name: "Conserto do Carro",
                amount: 450.00,
                category: categoryMap["transporte"],
                frequency: frequency.ONCE,
                seriesId: null,
                startDate: baseDate,
                dueDate: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 12)),
                finishDate: null
            },
            {
                name: "Consulta Médica",
                amount: 250.00,
                category: categoryMap["saúde"],
                frequency: frequency.ONCE,
                seriesId: null,
                startDate: baseDate,
                dueDate: new Date(Date.UTC(now.getFullYear(), now.getMonth(), 18)),
                finishDate: null
            }
        ];

        // 4. Gerando Séries Recorrentes
        console.log("Generating Recurrent Expenses...");

        // Exemplo 1: Aluguel (Mensal por 1 ano)
        const rentSeriesId = new mongoose.Types.ObjectId();
        const rentStartDate = new Date(Date.UTC(now.getFullYear(), 0, 1)); // Jan do ano atual
        const rentFinishDate = calculateNextDate(rentStartDate, frequency.YEARLY);

        const rentExpenses = generateRecurrentSeries({
            baseData: {
                name: "Aluguel",
                amount: 1800.00,
                category: categoryMap["moradia"]
            },
            seriesId: rentSeriesId,
            startDate: rentStartDate,
            dueDate: new Date(Date.UTC(now.getFullYear(), 0, 10)),
            finishDate: rentFinishDate,
            newFrequency: frequency.MONTHLY
        });

        // Exemplo 2: Internet (Mensal por 1 ano)
        const internetSeriesId = new mongoose.Types.ObjectId();
        const internetStartDate = new Date(Date.UTC(now.getFullYear(), 0, 1));
        const internetFinishDate = calculateNextDate(internetStartDate, frequency.YEARLY);

        const internetExpenses = generateRecurrentSeries({
            baseData: {
                name: "Internet Fibra",
                amount: 120.00,
                category: categoryMap["moradia"]
            },
            seriesId: internetSeriesId,
            startDate: internetStartDate,
            dueDate: new Date(Date.UTC(now.getFullYear(), 0, 15)),
            finishDate: internetFinishDate,
            newFrequency: frequency.MONTHLY
        });

        // 5. Unifica e insere todas as despesas no banco
        const allExpensesToInsert = [
            ...singleExpenses,
            ...rentExpenses,
            ...internetExpenses
        ];

        console.log(`Inserting ${allExpensesToInsert.length} total expenses...`);
        await Expense.insertMany(allExpensesToInsert);

        console.log("\nSeed completed successfully! Status:");
        console.log(`- Categories inserted: ${createdCategories.length}`);
        console.log(`- Expenses inserted: ${allExpensesToInsert.length}`);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);

    } catch (error) {
        console.error("Error seeding database:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedDatabase();*/}