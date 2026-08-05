import { Router } from "express";
import * as expenseController from "../controllers/expenseController.js";

const expensesRouter = Router();

expensesRouter.post("/create", expenseController.handleCreateExpense);
expensesRouter.delete("/:id", expenseController.handleDeleteExpense);
expensesRouter.put("/:id", expenseController.handleUpdateExpense);
expensesRouter.get("/monthly", expenseController.handleGetExpensesByMonth);
expensesRouter.get("/series/:seriesId", expenseController.handleGetExpensesBySeries);

export default expensesRouter;