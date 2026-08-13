import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../config/authMiddleware.js";

const usersRouter = Router();

usersRouter.post('/register', userController.register);
usersRouter.post('/login', userController.login);
usersRouter.get('/me', authMiddleware, userController.getProfile);

export default usersRouter;