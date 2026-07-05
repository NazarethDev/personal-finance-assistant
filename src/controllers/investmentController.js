import * as investmentService from "../services/investmentService.js";
import { HttpStatusCode } from "axios";

export async function handleCreateShortInvestment(req, res) {
    try {
        const newInvestment = await investmentService.createShort(req.body);
        return res.status(HttpStatusCode.Created).json(newInvestment);
    } catch (error) {
        console.error("Erro ao criar histórico de investimento:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de investimento.",
            error: error.message
        });
    }
}

export async function handleCreateLongInvestment(req, res) {
    try {
        const newLongInvestment = await investmentService.createLong(req.body);
        return res.status(HttpStatusCode.Created).json(newLongInvestment);
    } catch (error) {
        console.error("Erro ao criar investimento longo:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o investimento.",
            error: error.message
        });
    }
}

export async function handleDeleteInvestment(req, res) {
    const { id } = req.params;
    try {
        await investmentService.removeInvestment(id);
        return res.status(HttpStatusCode.Ok).json({ message: 'Investimento deletado com sucesso.' });
    } catch (error) {
        if (error.message === "INVESTMENT_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Investment not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar o investimento.",
            error: error.message
        });
    }
}

export async function handleUpdateInvestment(req, res) {
    const { id } = req.params;
    try {
        const updated = await investmentService.modifyInvestment(id, req.body);
        return res.status(HttpStatusCode.Ok).json({
            message: "Investment successfully updated.",
            data: updated
        });
    } catch (error) {
        if (error.message === "INVESTMENT_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Investment not found' });
        }
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar o investimento.",
            error: error.message
        });
    }
}