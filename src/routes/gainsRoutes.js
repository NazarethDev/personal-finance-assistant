import { Router } from "express";
import * as gainController from "../controllers/gainController.js";

const gainsRouter = Router();

gainsRouter.post("/create", gainController.handleCreateGain);
gainsRouter.delete("/:id", gainController.handleDeleteGain);
gainsRouter.put("/:id", gainController.handleUpdateGain);
gainsRouter.get("/monthly", gainController.handleGetGainsByMonth);
gainsRouter.get("/series/:seriesId", gainController.handleGetGainsBySeries);
gainsRouter.get("/category", gainController.handleGetGainsByCategoryAndMonth);

export default gainsRouter;