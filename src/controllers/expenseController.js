import * as service from "../services/expenseService.js";
import { HttpStatusCode } from "axios";
import { createExpenseDTO, updateExpenseDTO } from "../models/expensesModels/expenseDTO.js";
import { validateOperationMode } from "../utils/normalizeMode.js";

export async function handleCreateExpense(req, res) {
    try {
        const userId = req.userId;

        const expenseData = createExpenseDTO({
            ...req.body,
            preferredCurrency: req.user?.preferredCurrency
        });
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
        const preferredCurrency = req.user?.preferredCurrency;

        const parsedDTO = updateExpenseDTO({
            ...req.body,
            preferredCurrency
        });

        const mode = parsedDTO.mode ? validateOperationMode(parsedDTO.mode) : undefined;

        const updatedExpense = await service.modifyExpense(userId, id, {
            ...parsedDTO.updateData,
            mode
        });

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

export async function handleGetMonthlyExpensesConverted(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        const { year, month, targetCurrency } = req.query;

        if (!year || !month || !targetCurrency) {
            return res.status(HttpStatusCode.BadRequest).json({
                error: 'Parâmetros obrigatórios ausentes: year, month e targetCurrency são necessários.'
            });
        }

        const parsedYear = Number(year);
        const parsedMonth = Number(month);

        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            return res.status(HttpStatusCode.BadRequest).json({ error: 'Ano ou mês fornecidos são inválidos.' });
        }

        const expenses = await service.getMonthlyExpensesConverted(
            userId,
            parsedYear,
            parsedMonth,
            targetCurrency
        );

        return res.status(HttpStatusCode.Ok).json(expenses);

    } catch (error) {
        console.error('[Expense Controller] Erro em handleGetMonthlyExpensesConverted:', error.message);
        return res.status(HttpStatusCode.InternalServerError).json({ error: 'Erro interno ao buscar despesas do mês.' });
    }
}

export async function handleGetExpensesByCurrencyAndPeriod(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        const { baseCurrency, year, month, targetCurrency } = req.query;

        if (!baseCurrency || !year || !month) {
            return res.status(HttpStatusCode.BadRequest).json({
                error: 'Parâmetros obrigatórios ausentes: baseCurrency, year e month são necessários.'
            });
        }

        const parsedYear = Number(year);
        const parsedMonth = Number(month);

        if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            return res.status(HttpStatusCode.BadRequest).json({ error: 'Ano ou mês fornecidos são inválidos.' });
        }

        const expenses = await service.getExpensesByCurrencyAndPeriod(
            userId,
            baseCurrency,
            parsedYear,
            parsedMonth,
            targetCurrency || null
        );

        return res.status(HttpStatusCode.Ok).json(expenses);

    } catch (error) {
        console.error('[Expense Controller] Erro em handleGetExpensesByCurrencyAndPeriod:', error.message);
        return res.status(HttpStatusCode.InternalServerError).json({ error: 'Erro interno ao buscar despesas por moeda e período.' });
    }
}