import * as investmentService from "../services/investmentService.js";
import { HttpStatusCode } from "axios";
import { createInvestmentDTO, updateInvestmentDTO } from "../models/investmentsModels/investmentDTO.js";

export async function handleCreatetInvestment(req, res) {
    try {
        const investmentData = createInvestmentDTO(req.body);

        const newInvestment = await investmentService.create(investmentData);

        return res.status(HttpStatusCode.Created).json(newInvestment);
    } catch (error) {
        console.error("Erro ao criar investimento:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar investimento.",
            error: error.message
        });
    }
}

export async function handleUpdateInvestment(req, res) {
    try {
        const { id } = req.params;

        const parsedBody = updateInvestmentDTO(req.body);

        const updatedInvestment = await investmentService.modifyInvestment(id, parsedBody);

        return res.status(HttpStatusCode.Ok).json(updatedInvestment);

    } catch (error) {
        if (error.message === "INVESTMENT_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Investment not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar investimento.",
            error: error.message
        });
    }
}

export async function handleDeleteInvestment(req, res) {
    try {
        const { id } = req.params;
        const { mode = 'SINGLE' } = req.query;

        await investmentService.removeInvestment(id, mode);

        return res.status(HttpStatusCode.Ok).json({
            message: `investimento(s) removido(s) com sucesso. (Modo: ${mode})`
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
        const { year, month } = req.query;

        const data = await investmentService.getByMonth(year, month);

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
        const { seriesId } = req.params;

        const data = await investmentService.getBySeries(seriesId);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "SERIES_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({
                message: "Nenhum investimento encontrada para a série informada."
            });
        }
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar despesas da série.",
            error: error.message
        });
    }
}

export async function handleGetInvestmentsByCategoryAndMonth(req, res) {
    try {
        const { category, year, month } = req.query;

        const data = await investmentService.getByCategoryAndMonth(category, year, month);

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
            message: "Erro interno ao buscar investimentos por categoria no mês.",
            error: error.message
        });
    }
}