import * as service from "../services/gainService.js";
import { HttpStatusCode } from "axios";
import { createGainDTO, updateGainDTO } from "../models/gainsModels/gainDTO.js";
import { validateOperationMode } from "../utils/normalizeMode.js";

export async function handleCreateGain(req, res) {
    try {
        const userId = req.userId;

        const gainData = createGainDTO(req.body);

        const newGain = await service.create(userId, gainData);

        return res.status(HttpStatusCode.Created).json(newGain);
    } catch (error) {
        console.error("Erro ao criar receita longa:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar receita.",
            error: error.message
        });
    }
}

export async function handleUpdateGain(req, res) {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const parsedDTO = updateGainDTO(req.body);

        const mode = parsedDTO.mode ? validateOperationMode(parsedDTO.mode) : undefined;
        const updateData = { ...parsedDTO };
        delete updateData.mode;

        const updatedGain = await service.modifyGain(userId, id, req.body);

        return res.status(HttpStatusCode.Ok).json(updatedGain);

    } catch (error) {
        if (error.message === "GAIN_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: "Receita não encontrada." });
        }
        if (error.message === "INVALID_CATEGORY") {
            return res.status(HttpStatusCode.BadRequest).json({ message: "Categoria informada é inválida." });
        }
        console.error("Erro ao atualizar receita:", error);
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao atualizar receita.",
            error: error.message
        });
    }
}

export async function handleDeleteGain(req, res) {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const mode = validateOperationMode(req.query.mode);

        await service.removeGain(userId, id, mode);

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
            message: "Erro interno ao buscar receitas do mês.",
            error: error.message
        });
    }
}

export async function handleGetGainsBySeries(req, res) {
    try {
        const userId = req.userId;

        const { seriesId } = req.params;

        const data = await service.getBySeries(userId, seriesId);

        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        if (error.message === "SERIES_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({
                message: "Nenhuma receita encontrada para a série informada."
            });
        }
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar receitas da série.",
            error: error.message
        });
    }
}

export async function handleGetGainsByCategoryAndMonth(req, res) {
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

        console.error("Erro ao buscar receitas por categoria no mês:", error);
        return res.status(HttpStatusCode.InternalServerError).json({
            message: "Erro interno ao buscar receitas por categoria no mês.",
            error: error.message
        });
    }
}