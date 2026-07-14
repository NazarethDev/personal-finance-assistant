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

export async function handleDeleteExpense(req, res) {
    const { id } = req.params;
    const deleteMode = req.query.deleteMode || "single";

    try {
        await expenseService.removeExpense(id, deleteMode);

        const feedbackMessages = {
            all: 'A regra recorrente e todos os registros (passados e futuros) foram removidos.',
            future: 'A regra recorrente foi encerrada e os lançamentos futuros foram removidos.',
            past: 'Históricos passados vinculados à recorrência foram removidos.',
            single: 'Registro deletado com sucesso.'
        };

        return res.status(HttpStatusCode.Ok).json({
            message: feedbackMessages[deleteMode] || feedbackMessages.single
        });
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
    try {
        const { id } = req.params;
        const cleanUpdateData = updateExpenseDTO(req.body);
        const updatedExpense = await expenseService.modifyExpense(id, cleanUpdateData);

        return res.status(HttpStatusCode.Ok).json(updatedExpense)

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