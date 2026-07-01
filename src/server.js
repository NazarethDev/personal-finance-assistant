import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";

dotenv.config();

const APP_PORT = process.env.APP_PORT || 3001;

const WS_PORT = process.env.WS_PORT || 3002;

async function startServer() {
    try {
        await connectDB();

        app.listen(APP_PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Falha crítica: Não foi possível iniciar o servidor devido ao banco de dados.", error);
        process.exit(1);
    }
}

startServer();