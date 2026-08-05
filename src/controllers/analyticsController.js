import { getDashboardAnalytics, getCalendarData } from "../services/analyticsService.js";
import { parseYearMonthQuery, getMonthDateRange, getDashboardDateRanges } from "../utils/dashboardDateValidator.js";

// GET /api/analytics/dashboard?year=2026&month=8
export const getDashboardController = async (req, res) => {
    try {
        const { currentStart, currentEnd, previousStart, previousEnd } = getDashboardDateRanges(
            req.query.year,
            req.query.month
        );

        const data = await getDashboardAnalytics(currentStart, currentEnd, previousStart, previousEnd);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao gerar dashboard." });
    }
};

// GET /api/analytics/calendar?year=2026&month=8
export const getCalendarController = async (req, res) => {
    try {
        const { year, month } = parseYearMonthQuery(req.query.year, req.query.month);
        const { startDate, endDate } = getMonthDateRange(year, month);

        const data = await getCalendarData(startDate, endDate);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao gerar dados do calendário." });
    }
};