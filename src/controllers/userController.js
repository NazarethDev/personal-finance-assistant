import { HttpStatusCode } from "axios";

import * as userService from "../services/userService.js";

export async function register(req, res) {
    try {
        const user = await userService.createUser(req.body);
        return res.status(HttpStatusCode.Created).json(user);
    } catch (error) {
        return res.status(HttpStatusCode.BadRequest).json({ message: error.message });
    }
};

export async function login(req, res) {
    try {
        const result = await userService.authenticateUser(req.body);
        return res.status(HttpStatusCode.Ok).json(result);
    } catch (error) {
        return res.status(HttpStatusCode.Unauthorized).json({ message: error.message });
    }
};

export async function getProfile(req, res) {
    try {
        const user = await userService.getUserProfile(req.userId);
        return res.status(HttpStatusCode.Ok).json(user);
    } catch (error) {
        return res.status(HttpStatusCode.NotFound).json({ message: error.message });
    }
};