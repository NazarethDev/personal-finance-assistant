import { Router } from "express";
import * as analyticsController from "../controllers/analyticsController.js";

const analyticsRouter = Router();

analyticsRouter.get("/general-analytics", analyticsController.getDashboardController);
analyticsRouter.get("/calendar", analyticsController.getCalendarController);

export default analyticsRouter;