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

export async function handleGetExpensesByMonth(req, res) {
    try {
        const { year, month } = req.query; // ou req.params

        const data = await expenseService.getByMonth(year, month);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "INVALID_DATE_PARAMETERS") {
            return res.status(HttpStatusCode.BadRequest).json({
                message: "Mês ou ano inválidos. Informe um ano válido e um mês entre 1 e 12."
            });
        }
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar despesas do mês.",
            error: error.message
        });
    }
}

export async function handleGetExpensesBySeries(req, res) {
    try {
        const { seriesId } = req.params;

        const data = await expenseService.getBySeries(seriesId);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "SERIES_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({
                message: "Nenhuma despesa encontrada para a série informada."
            });
        }
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar despesas da série.",
            error: error.message
        });
    }
}

// GET /expenses/category?category=habitação&year=2026&month=8
export async function handleGetExpensesByCategoryAndMonth(req, res) {
    try {
        const { category, year, month } = req.query;

        const data = await expenseService.getByCategoryAndMonth(category, year, month);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "INVALID_DATE_PARAMETERS") {
            return res.status(HttpStatusCode.BadRequest).json({
                message: "Mês ou ano inválidos. Informe um ano válido e um mês entre 1 e 12."
            });
        }

        if (error.message === "INVALID_CATEGORY") {
            return res.status(HttpStatusCode.BadRequest).json({
                message: "Categoria inválida.",
                error: error.message
            });
        }

        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar despesas por categoria no mês.",
            error: error.message
        });
    }
}