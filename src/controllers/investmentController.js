import * as investmentService from "../services/investmentService.js";
import { HttpStatusCode } from "axios";
import { createInvestmentDTO, updateInvestmentDTO } from "../models/investmentsModels/investmentDTO.js";

export async function handleCreatetInvestment(req, res) {
    try {
        const investmentData = createInvestmentDTO(req.body);

        const newInvestment = await investmentService.createLong(investmentData);

        return res.status(HttpStatusCode.Created).json(newInvestment);
    } catch (error) {
        console.error("Erro ao criar histórico de investimento:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de investimento.",
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
    try {
        const { id } = req.params;
        const cleanUpdateData = updateInvestmentDTO(req.body);
        const updatedInvestment = await investmentService.modifyInvestment(id, cleanUpdateData);

        return res.status(HttpStatusCode.Ok).json(updatedInvestment);
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