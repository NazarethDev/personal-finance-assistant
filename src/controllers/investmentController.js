import * as service from "../services/investmentService.js";
import { HttpStatusCode } from "axios";
import { createInvestmentDTO, updateInvestmentDTO } from "../models/investmentsModels/investmentDTO.js";
import { validateOperationMode } from "../utils/normalizeMode.js"

export async function handleCreateInvestment(req, res) {
    try {
        const userId = req.userId;

        const investmentData = createInvestmentDTO(req.body);

        const newInvestment = await service.create(userId, investmentData);

        return res.status(HttpStatusCode.Created).json(newInvestment);
    } catch (error) {
        console.error("Erro ao criar investimento longa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar investimento.",
            error: error.message
        });
    }
}

export async function handleUpdateInvestment(req, res) {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const parsedDTO = updateInvestmentDTO(req.body);

        const mode = parsedDTO.mode ? validateOperationMode(parsedDTO.mode) : undefined;
        const updateData = { ...parsedDTO };
        delete updateData.mode;

        const updatedInvestment = await service.modifyInvestment(userId, id, req.body);

        return res.status(HttpStatusCode.Ok).json(updatedInvestment);

    } catch (error) {
        if (error.message === "INVESTMENT_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: "Investimento não encontrada." });
        }
        if (error.message === "INVALID_CATEGORY") {
            return res.status(HttpStatusCode.BadRequest).json({ message: "Categoria informada é inválida." });
        }
        console.error("Erro ao atualizar investimento:", error);
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao atualizar investimento.",
            error: error.message
        });
    }
}

export async function handleDeleteInvestment(req, res) {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const mode = validateOperationMode(req.query.mode);

        await service.removeInvestment(userId, id, mode);

        return res.status(HttpStatusCode.Ok).json({
            message: `Investimento(s) removida(s) com sucesso. (Modo: ${mode})`
        });

    } catch (error) {
        if (error.message === "INVESTMENT_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Investment not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar investimento.",
            error: error.message
        });
    }
}

export async function handleGetInvestmentsByMonth(req, res) {
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
            message: "Erro interno ao buscar investimentos do mês.",
            error: error.message
        });
    }
}

export async function handleGetInvestmentsBySeries(req, res) {
    try {
        const userId = req.userId;

        const { seriesId } = req.params;

        const data = await service.getBySeries(userId, seriesId);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "SERIES_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({
                message: "Nenhuma investimento encontrada para a série informada."
            });
        }
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar investimentos da série.",
            error: error.message
        });
    }
}

export async function handleGetInvestmentsByCategoryAndMonth(req, res) {
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

        console.error("Erro ao buscar investimentos por categoria no mês:", error);
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar investimentos por categoria no mês.",
            error: error.message
        });
    }
}