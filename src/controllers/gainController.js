import * as gainService from "../services/gainService.js";
import { HttpStatusCode } from "axios";
import { createGainDTO, updateGainDTO } from "../models/gainsModels/gainDTO.js";

export async function handleCreateGain(req, res) {
    try {
        const gainData = createGainDTO(req.body);

        const newGain = await gainService.create(gainData)

        return res.status(HttpStatusCode.Created).json(newGain);
    } catch (error) {
        console.error("Erro ao criar o novo ganho:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o novo ganho.",
            error: error.message
        });
    }
}

export async function handleUpdateGain(req, res) {
    try {
        const { id } = req.params;

        const parsedBody = updateGainDTO(req.body);

        const updatedGain = await gainService.modifyGain(id, parsedBody);

        return res.status(HttpStatusCode.Ok).json(updatedGain);

    } catch (error) {
        if (error.message === "GAIN_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Gain not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar receita.",
            error: error.message
        });
    }
}

export async function handleDeleteGain(req, res) {
    try {
        const { id } = req.params;
        const { mode = 'SINGLE' } = req.query;

        await gainService.removeGain(id, mode);

        return res.status(HttpStatusCode.Ok).json({
            message: `Receita(s) removida(s) com sucesso. (Modo: ${mode})`
        });

    } catch (error) {
        if (error.message === "GAIN_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Gain not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar receita.",
            error: error.message
        });
    }
}

export async function handleGetGainsByMonth(req, res) {
    try {
        const { year, month } = req.query;

        const data = await gainService.getByMonth(year, month);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "INVALID_DATE_PARAMETERS") {
            return res.status(HttpStatusCode.BadRequest).json({
                message: "Mês ou ano inválidos. Informe um ano válido e um mês entre 1 e 12."
            });
        }
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar receitas do mês.",
            error: error.message
        });
    }
}

export async function handleGetGainsBySeries(req, res) {
    try {
        const { seriesId } = req.params;

        const data = await gainService.getBySeries(seriesId);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "SERIES_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({
                message: "Nenhuma receita encontrada para a série informada."
            });
        }
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar despesas da série.",
            error: error.message
        });
    }
}

export async function handleGetGainsByCategoryAndMonth(req, res) {
    try {
        const { category, year, month } = req.query;

        const data = await gainService.getByCategoryAndMonth(category, year, month);

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
            message: "Erro interno ao buscar rceitas por categoria no mês.",
            error: error.message
        });
    }
}