import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";

const categoriesRouter = Router();

categoriesRouter.post("/", categoryController.create);
categoriesRouter.get("/", categoryController.getAll);
categoriesRouter.get("/:id", categoryController.getById);
categoriesRouter.put("/:id", categoryController.update);
categoriesRouter.delete("/:id", categoryController.remove);

export default categoriesRouter;