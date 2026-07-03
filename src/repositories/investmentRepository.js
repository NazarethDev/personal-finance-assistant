import { InvestmentHistory } from "../models/investmentsModels/investmentHistoryTemplate.js";
import { InvestmentTemplate as LongInvestment } from "../models/investmentsModels/investmentTemplateSchema.js";
import { HttpStatusCode } from "axios";

async function verifyExistence(id) {
    const existsInHistory = await InvestmentHistory.exists({ _id: id });
    if (existsInHistory) return 'existsInHistory';

    const existsInLongInvestment = await LongInvestment.exists({ _id: id });
    if (existsInLongInvestment) return 'existsInLongInvestment';

    return null;
};

export async function createShortInvestment(req, res) {
    try {

        const { name, amount, investmentCategory, dueDate, templateId } = req.body;

        const newInvestmentHistory = await InvestmentHistory.create({
            name,
            amount,
            investmentCategory,
            dueDate,
            templateId
        });

        return res.status(HttpStatusCode.Created).json(newInvestmentHistory);
    } catch (error) {
        console.error("Erro ao criar histórico de investimento:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de investimento.",
            error: error.message
        });
    }
}

export async function createLongInvestment(req, res) {
    try {
        const { name, amount, investmentCategory, investmentFrequency, dueDate, startDate, finishDate } = req.body;

        const newLongInvstment = await LongInvestment.create({
            name,
            amount,
            investmentCategory,
            investmentFrequency,
            dueDate,
            startDate,
            finishDate
        });

        return res.status(HttpStatusCode.Created).json(newLongInvstment);

    } catch (error) {
        console.error("Erro ao criar histórico de investimento:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao salvar o histórico de investimento.",
            error: error.message
        });
    }
}

export async function deleteInvestment(req, res) {
    const { id } = req.params;

    try {

        const exists = await verifyExistence(id);

        if (exists == 'existsInHistory') {
            await InvestmentHistory.findByIdAndDelete(id);
            return res.status(HttpStatusCode.Ok).json({ message: 'Investimento deletado com sucesso.' });

        }
        if (exists == 'existsInLongInvestment') {
            await LongInvestment.findByIdAndDelete(id);
            return res.status(HttpStatusCode.Ok).json({ message: 'Investimento deletado com sucesso.' });

        }
        if (!exists) {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Investment not found' });

        };

    } catch (error) {
        console.error("Erro ao excluir investimento:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao deletar o histórico de investimento.",
            error: error.message
        });
    }
}

export async function updateInvestment(req, res) {

    const { id } = req.params;

    const { name, amount, investmentCategory, investmentFrequency, dueDate, startDate, finishDate, templateId } = req.body;

    try {
        const exists = await verifyExistence(id);

        if (!exists) {
            return res.status(HttpStatusCode.NotFound).json({ message: 'Investment not found' });
        }
        const updateData = {
            name,
            amount,
            investmentCategory,
            investmentFrequency,
            dueDate,
            startDate,
            finishDate,
            templateId
        };

        if (exists == 'existsInHistory') {
            const updated = await InvestmentHistory.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return res.status(HttpStatusCode.Ok).json({
                message: "Investment successfully updated.",
                data: updated
            });
        }

        if (exists == 'existsInLongInvestment') {
            const updated = await LongInvestment.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );
            return res.status(HttpStatusCode.Ok).json({
                message: "investment successfully updated.",
                data: updated
            });
        }

    } catch (error) {
        console.error("Erro au atualizar investimento:", error);
        return res.status(HttpStatusCode.BadRequest).json({
            message: "Erro interno ao atualizar o investimento.",
            error: error.message
        });
    };


}