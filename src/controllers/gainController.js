import * as gainService from "../services/gainService.js";
import { HttpStatusCode } from "axios";

export async function handleCreateShortGain(req, res) {
    try {
        const newGain = await gainService.createShort(req.body);
        return res.status(HttpStatusCode.Created).json(newGain);
    } catch (error) {
        console.error("Erro ao criar registro de ganho:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de ganhos.",
            error: error.message
        });
    }
}

export async function handleCreateLongGain(req, res) {
    try {
        const newLongGain = await gainService.createLong(req.body);
        return res.status(HttpStatusCode.Created).json(newLongGain);
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
    try {
        await gainService.removeGain(id);
        return res.status(HttpStatusCode.Ok).json({ message: 'Ganho deletado com sucesso.' });
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
    const { id } = req.params;
    try {
        const updated = await gainService.modifyGain(id, req.body);
        return res.status(HttpStatusCode.Ok).json({
            message: "Gain successfully updated.",
            data: updated
        });
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