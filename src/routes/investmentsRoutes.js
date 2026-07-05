import { Router } from "express";
import * as investmentController from "../controllers/investmentController.js";
const investmentsRouter = Router();

investmentsRouter.post("/short", investmentController.handleCreateShortInvestment);
investmentsRouter.post("/long", investmentController.handleCreateLongInvestment);
investmentsRouter.delete("/:id", investmentController.handleDeleteInvestment);
investmentsRouter.put("/:id", investmentController.handleUpdateInvestment);

export default investmentsRouter;