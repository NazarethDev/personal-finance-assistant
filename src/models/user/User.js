import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    preferredCurrency: { type: String, required: true }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


export const User = mongoose.model("User", userSchema);