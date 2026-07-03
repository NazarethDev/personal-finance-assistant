import { ExpenseHistory } from "../models/expensesModels/expenseHistorySchema.js";
import { ExpenseTemplate as LongExpense } from "../models/expensesModels/expenseTemplateSchema.js"
import { HttpStatusCode } from "axios";

async function verifyExistence(id) {
    const existsInHistory = await ExpenseHistory.exists({ _id: id });
    if (existsInHistory) return 'existsInHistory';

    const existsInLongExpense = await LongExpense.exists({ _id: id });
    if (existsInLongExpense) return 'existsInLongExpense';

    return null;
}

export async function createShortExpense(req, res) {
    try {
        const { name, amount, expenseCategory, dueDate, templateId } = req.body;

        const newShortExpense = await ExpenseHistory.create({
            name,
            amount,
            expenseCategory,
            dueDate,
            templateId
        });

        return res.status(HttpStatusCode.Created).json(newShortExpense);
    } catch (error) {
        console.error("Erro ao criar histórico de gastos:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de gastos.",
            error: error.message
        });
    }
}

export async function createLongExpense(req, res) {
    try {
        const { name, amount, expenseCategory, expenseFrequency, dueDate, startDate } = req.body;

        const newLongExpense = await LongExpense.create({
            name,
            amount,
            expenseCategory,
            expenseFrequency,
            dueDate,
            startDate
        });

        return res.status(HttpStatusCode.Created).json(newLongExpense);
    } catch (error) {
        console.error("Erro ao criar despesa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar despesa.",
            error: error.message
        });
    }
}

export async function deleteExpense(req, res) {
    const { id } = req.params;

    try {
        const exists = verifyExistence(id);

        if (exists == existsInHistory) {
            await ExpenseHistory.findByIdAndDelete(id);
            return res.status(HttpStatusCode.Ok).json({ message: 'Despesa deletada com sucesso.' });
        };

        if (exists == 'existsInLongExpense') {
            await LongExpense.findByIdAndDelete(id);
            return res.status(HttpStatusCode.Ok).json({ message: 'Despesa deletada com sucesso.' });
        };

        if (!exists) {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Investment not found' });

        };

    } catch (error) {
        console.error("Erro ao excluir despesa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar a despesa.",
            error: error.message
        });
    }
}

export async function updateExpense(req, res) {
    const { id } = req.params;

    const { name, amount, expenseCategory, expenseFrequency, dueDate, startDate, templateId } = req.body;

    try {

        const exists = await verifyExistence(id);

        const updateData = {
            name,
            amount,
            expenseCategory,
            expenseFrequency,
            dueDate,
            startDate,
            templateId
        };

        if (!exists) {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Expense not found' });
        }

        if (exists == 'existsInHistory') {
            const updated = await ExpenseHistory.findOneAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return res.status(HttpStatusCode.Ok).json({
                message: "Expense successfully updated.",
                data: updated
            });

        };

        if (exists == 'existsInLongExpense') {
            const updated = await LongExpense.findOneAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return res.status(HttpStatusCode.Ok).json({
                message: "Expense successfully updated.",
                data: updated
            });
        }

    } catch (error) {
        console.error("Erro au atualizar despesa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar despesa.",
            error: error.message
        });
    }
}