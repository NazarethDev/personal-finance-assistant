import { Router } from "express";
import * as investmentController from "../controllers/investmentController.js";
const investmentsRouter = Router();

investmentsRouter.post("/create", investmentController.handleCreateInvestment);
investmentsRouter.delete("/:id", investmentController.handleDeleteInvestment);
investmentsRouter.put("/:id", investmentController.handleUpdateInvestment);
investmentsRouter.get("/monthly", investmentController.handleGetInvestmentsByMonth);
investmentsRouter.get("/series/:seriesId", investmentController.handleGetInvestmentsBySeries);
investmentsRouter.get("/category", investmentController.handleGetInvestmentsByCategoryAndMonth);

export default investmentsRouter;