import { InvestmentHistory } from "../models/investmentsModels/investmentHistoryTemplate.js";
import { InvestmentTemplate } from "../models/investmentsModels/investmentTemplateSchema.js";
import { HttpStatusCode } from "axios";

export async function createInvestmentHistory(req, res) {
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
        return res.status(500).json({
            message: "Erro interno ao salvar o histórico de investimento.",
            error: error.message
        });
    }
}