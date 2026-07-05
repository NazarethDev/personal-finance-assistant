import { Router } from "express";
import * as investmentController from "../controllers/investmentController.js";
const investmentsRouter = Router();

investmentsRouter.post("/create", investmentController.handleCreatetInvestment);
investmentsRouter.delete("/:id", investmentController.handleDeleteInvestment);
investmentsRouter.put("/:id", investmentController.handleUpdateInvestment);

export default investmentsRouter;