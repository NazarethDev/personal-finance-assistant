import * as expenseService from "../services/expenseService.js";
import { HttpStatusCode } from "axios";

export async function handleCreateShortExpense(req, res) {
    try {
        const newExpense = await expenseService.createShort(req.body);
        return res.status(HttpStatusCode.Created).json(newExpense);
    } catch (error) {
        console.error("Erro ao criar histórico de despesa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de gastos.",
            error: error.message
        });
    }
}

export async function handleCreateLongExpense(req, res) {
    try {
        const newLongExpense = await expenseService.createLong(req.body);
        return res.status(HttpStatusCode.Created).json(newLongExpense);
    } catch (error) {
        console.error("Erro ao criar despesa longa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar despesa.",
            error: error.message
        });
    }
}

export async function handleDeleteExpense(req, res) {
    const { id } = req.params;
    try {
        await expenseService.removeExpense(id);
        return res.status(HttpStatusCode.Ok).json({ message: 'Despesa deletada com sucesso.' });
    } catch (error) {
        if (error.message === "EXPENSE_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Expense not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar a despesa.",
            error: error.message
        });
    }
}

export async function handleUpdateExpense(req, res) {
    const { id } = req.params;
    try {
        const updated = await expenseService.modifyExpense(id, req.body);
        return res.status(HttpStatusCode.Ok).json({
            message: "Expense successfully updated.",
            data: updated
        });
    } catch (error) {
        if (error.message === "EXPENSE_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Expense not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar despesa.",
            error: error.message
        });
    }
}