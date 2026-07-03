import { GainHistory } from "../models/gainsModels/gainHistoryTemplate.js";
import { GainTemplate as LongGain } from "../models/gainsModels/gainTemplateSchema.js"
import { HttpStatusCode } from "axios";

async function verifyExistence(id) {
    const existsInLongGain = await GainHistory.exists({ _id: id });
    if (existsInLongGain) return 'existsInLongGain';

    const existsInGainHistory = await GainHistory.exists({ _id: id });
    if (existsInGainHistory) return 'existsInGainHistory';

    return null;
};

export async function createShortGain(req, res) {
    try {
        const {
            name,
            amount,
            gainCategory,
            dueDate,
            templateId } = req.body;
        const newGainHistory = await GainHistory.create({
            name,
            amount,
            gainCategory,
            dueDate,
            templateId
        });
        return res.status(HttpStatusCode.Created).json(newGainHistory);
    } catch (error) {
        console.error("Erro ao criar registro de ganho:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de ganhos.",
            error: error.message
        });
    }
}

export async function createLongGain(req, res) {
    try {
        const {
            name,
            amount,
            gainCategory,
            gainFrequency,
            dueDate,
            startDate } = req.body;

        const newLongGain = await LongGain.create({
            name,
            amount,
            gainCategory,
            gainFrequency,
            dueDate,
            startDate
        });

        return res.status(HttpStatusCode.Created).json(newLongGain);

    } catch (error) {
        console.error("Erro ao criar o novo ganho:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o novo ganho.",
            error: error.message
        });
    }
}

export async function deleteGain(req, res) {
    const { id } = req.params;

    try {

        const exists = await verifyExistence(id);

        if (exists == 'existsInLongGain') {
            await LongGain.findByIdAndDelete(id);
            return res.status(HttpStatusCode.Ok).json({ message: 'Ganho deletado com sucesso' });
        };

        if (exists == 'existsInGainHistory') {
            await GainHistory.findByIdAndDelete(id);
            return res.status(HttpStatusCode.Ok).json({ message: 'Ganho deletado com sucesso' });
        }

        if (!exists) {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Gain not found' });
        };

    } catch (error) {
        console.error("Erro ao excluir ganho:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar o ganho.",
            error: error.message
        });
    }
}

export async function updateGain(req, res) {
    const { id } = req.params;

    const { name, amount, gainCategory, gainFrequency, dueDate, startDate, templateId } = req.body;

    try {
        const exists = await verifyExistence(id);

        if (!exists) {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Gain not found' });
        }

        const updateData = {
            name,
            amount,
            gainCategory,
            gainFrequency,
            dueDate,
            startDate,
            templateId
        }

    } catch (error) {
        console.error("Erro au atualizar ganho:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar o ganho.",
            error: error.message
        });
    }
}