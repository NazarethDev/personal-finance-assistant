import { HttpStatusCode } from "axios";
import *as service from "../services/analyticsService.js";
import { parseYearMonthQuery, getMonthDateRange, getDashboardDateRanges } from "../utils/dashboardDateValidator.js";

// GET /api/analytics/dashboard?year=2026&month=8
export const getDashboardController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentStart, currentEnd, previousStart, previousEnd } = getDashboardDateRanges(
            req.query.year,
            req.query.month
        );

        const data = await service.getDashboardAnalytics(userId, currentStart, currentEnd, previousStart, previousEnd);
        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        return res.status(HttpStatusCode.InternalServerError).json({ error: "Erro ao gerar dashboard." });
    }
};

// GET /api/analytics/calendar?year=2026&month=8
export const getCalendarController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { year, month } = parseYearMonthQuery(req.query.year, req.query.month);
        const { startDate, endDate } = getMonthDateRange(userId, year, month);

        const data = await service.getCalendarData(startDate, endDate);
        return res.status(HttpStatusCode.Ok).json(data);
    } catch (error) {
        return res.status(HttpStatusCode.InternalServerError).json({ error: "Erro ao gerar dados do calendário." });
    }
};