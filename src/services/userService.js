import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import * as repo from "../repositories/userRepository.js";

dotenv.config();


export async function createUser(data) {

    const existingUser = await repo.findByEmail(data.email);

    if (existingUser) {
        throw new Error('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 11);

    const newUser = await repo.createUser({
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword
    });

    const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;

}

export async function authenticateUser(data) {

    const user = await repo.findByEmail(data.email);
    if (!user) {
        throw new Error('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas.');
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
        },
        token,
    };
}

export async function getUserProfile(id) {
    const user = repo.findById(id);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}