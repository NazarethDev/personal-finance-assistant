import * as service from "../services/expenseService.js";
import { HttpStatusCode } from "axios";
import { createExpenseDTO, updateExpenseDTO } from "../models/expensesModels/expenseDTO.js";
import { validateOperationMode } from "../utils/normalizeMode.js";

export async function handleCreateExpense(req, res) {
    try {
        const userId = req.userId;

        const expenseData = createExpenseDTO(req.body);

        const newExpense = await service.create(userId, expenseData);

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
        const userId = req.userId;
        const { id } = req.params;

        const parsedDTO = updateExpenseDTO(req.body);

        const mode = parsedDTO.mode ? validateOperationMode(parsedDTO.mode) : undefined;
        const updateData = { ...parsedDTO };
        delete updateData.mode;

        const updatedExpense = await service.modifyExpense(userId, id, req.body);

        return res.status(HttpStatusCode.Ok).json(updatedExpense);

    } catch (error) {
        if (error.message === "EXPENSE_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: "Despesa não encontrada." });
        }
        if (error.message === "INVALID_CATEGORY") {
            return res.status(HttpStatusCode.BadRequest).json({ message: "Categoria informada é inválida." });
        }
        console.error("Erro ao atualizar despesa:", error);
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao atualizar despesa.",
            error: error.message
        });
    }
}

export async function handleDeleteExpense(req, res) {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const mode = validateOperationMode(req.query.mode);

        await service.removeExpense(userId, id, mode);

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
        const userId = req.userId;
        const { year, month } = req.query;

        const data = await service.getByMonth(userId, year, month);

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
        const userId = req.userId;

        const { seriesId } = req.params;

        const data = await service.getBySeries(userId, seriesId);

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

export async function handleGetExpensesByCategoryAndMonth(req, res) {
    try {
        const userId = req.userId;
        const { category, year, month } = req.query;

        const data = await service.getByCategoryAndMonth(userId, category, year, month);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "INVALID_DATE_PARAMETERS") {
            return res.status(HttpStatusCode.BadRequest).json({
                message: "Mês ou ano inválidos. Informe um ano válido e um mês entre 1 e 12."
            });
        }

        if (error.message === "CATEGORY_REQUIRED" || error.message === "INVALID_CATEGORY") {
            return res.status(HttpStatusCode.BadRequest).json({
                message: "Categoria não informada ou inválida.",
                error: error.message
            });
        }

        console.error("Erro ao buscar despesas por categoria no mês:", error);
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar despesas por categoria no mês.",
            error: error.message
        });
    }
}