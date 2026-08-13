import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { HttpStatusCode } from 'axios';

dotenv.config();

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(HttpStatusCode.Unauthorized).json({ message: 'Token não fornecido.' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(HttpStatusCode.Unauthorized).json({ message: 'Erro no formato do token.' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(HttpStatusCode.Unauthorized).json({ message: 'Token malformatado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        return next();
    } catch (err) {
        return res.status(HttpStatusCode.Unauthorized).json({ message: 'Token inválido ou expirado.' });
    }
};