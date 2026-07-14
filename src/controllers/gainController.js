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

export async function handleDeleteGain(req, res) {
    const { id } = req.params;
    const deleteMode = req.query.deleteMode || "single";

    try {
        await gainService.removeGain(id, deleteMode);

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
        if (error.message === "GAIN_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Gain not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar o ganho.",
            error: error.message
        });
    }
}

export async function handleUpdateGain(req, res) {
    try {
        const { id } = req.params;

        const cleanUpdateData = updateGainDTO(req.body);

        const updatedGain = await gainService.modifyGain(id, cleanUpdateData);

        return res.status(HttpStatusCode.Ok).json(updatedGain);

    } catch (error) {
        if (error.message === "GAIN_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Gain not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar o ganho.",
            error: error.message
        });
    }
}