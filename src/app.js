import express from "express";
import cors from "cors";

import { corsOptions } from "./config/corsOptions.js";

import gainsRouter from "./routes/gainsRoutes.js";
import expensesRouter from "./routes/expensesRoutes.js";
import investmentsRouter from "./routes/investmentsRoutes.js";


const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use("/gains", gainsRouter);
app.use("/expenses", expensesRouter);
app.use("/investments", investmentsRouter);

app.use((req, res, next) => {
    console.log(`[DEBUG] Method: ${req.method} | URL: ${req.url} | Path: ${req.path}`);
    next();
});

app.get("/", (req, res) => {
    res.json({ status: "API online", timestamp: new Date() });
});

app.use((req, res) => {
    console.log(`[404 FINAL] O Express não encontrou nada para: ${req.path}`);
    res.status(404).json({ error: `Rota ${req.path} não encontrada.` });
});

export default app;