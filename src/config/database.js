import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let cached = global.mongoose || { conn: null, promise: null };

export const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_PATH, {
            bufferCommands: false
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("Database successfully connected ✅");
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.log("Database connection error ❌", error.message);
        throw error;
    }
};