import * as expenseService from "../services/expenseService.js";
import { HttpStatusCode } from "axios";
import { createExpenseDTO, updateExpenseDTO } from "../models/expensesModels/expenseDTO.js";

export async function handleCreateExpense(req, res) {
    try {
        const expenseData = createExpenseDTO(req.body);

        const newExpense = await expenseService.create(expenseData);

        return res.status(HttpStatusCode.Created).json(newExpense);
    } catch (error) {
        console.error("Erro ao criar despesa longa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar despesa.",
            error: error.message
        });
    }
}

export async function handleUpdateExpense(req, res) {
    try {
        const { id } = req.params;

        const parsedBody = updateExpenseDTO(req.body);

        const updatedExpense = await expenseService.modifyExpense(id, parsedBody);

        return res.status(HttpStatusCode.Ok).json(updatedExpense);

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

export async function handleDeleteExpense(req, res) {
    try {
        const { id } = req.params;
        const { mode = 'SINGLE' } = req.query;

        await expenseService.removeExpense(id, mode);

        return res.status(HttpStatusCode.Ok).json({
            message: `Despesa(s) removida(s) com sucesso. (Modo: ${mode})`
        });

    } catch (error) {
        if (error.message === "EXPENSE_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Expense not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar despesa.",
            error: error.message
        });
    }
}