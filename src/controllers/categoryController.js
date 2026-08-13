import { HttpStatusCode } from "axios";
import * as service from "../services/categoryService.js";

export async function create(req, res) {
    try {
        const category = await service.createCategory(req.body);
        return res.status(HttpStatusCode.Created).json(category);
    } catch (error) {
        if (error.message === "NAME_AND_TYPE_REQUIRED") {
            return res.status(HttpStatusCode.BadRequest).json({ error: "Nome e tipo são obrigatórios." });
        }

        if (error.message === "INVALID_CATEGORY_TYPE") {
            return res.status(HttpStatusCode.BadRequest).json({ error: "Tipo inválido. Use 'expense', 'gain' ou 'investment'." });
        }

        if (error.message === "CATEGORY_ALREADY_EXISTS" || error.code === 11000) {
            console.warn(`[WARN] Tentativa de criar categoria duplicada: ${req.body.name}`);
            return res.status(HttpStatusCode.Conflict).json({ error: "Já existe uma categoria com este nome e tipo." });
        }

        console.error("Error in categoryController.create:", error);
        return res.status(HttpStatusCode.InternalServerError).json({ error: "Erro interno ao criar categoria." });
    }
}

export async function getAll(req, res) {
    try {
        const { type } = req.query;
        const categories = await service.getCategories(type);
        return res.status(HttpStatusCode.Ok).json(categories);
    } catch (error) {
        console.error("Error in categoryController.getAll:", error);

        if (error.message === "INVALID_CATEGORY_TYPE") {
            return res.status(HttpStatusCode.BadRequest).json({ error: "Tipo de filtro inválido. Use 'expense', 'gain' ou 'investment'." });
        }

        return res.status(HttpStatusCode.InternalServerError).json({ error: "Erro interno ao buscar categorias." });
    }
}

export async function getById(req, res) {
    try {
        const { id } = req.params;
        const category = await service.getCategoryById(id);
        return res.status(HttpStatusCode.Ok).json(category);
    } catch (error) {
        console.error("Error in categoryController.getById:", error);

        if (error.message === "CATEGORY_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ error: "Categoria não encontrada." });
        }

        return res.status(HttpStatusCode.InternalServerError).json({ error: "Erro interno ao buscar categoria." });
    }
}

export async function update(req, res) {
    try {
        const { id } = req.params;
        const updatedCategory = await service.updateCategory(id, req.body);
        return res.status(HttpStatusCode.Ok).json(updatedCategory);
    } catch (error) {
        console.error("Error in categoryController.update:", error);

        if (error.message === "CATEGORY_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ error: "Categoria não encontrada." });
        }
        if (error.message === "INVALID_CATEGORY_TYPE") {
            return res.status(HttpStatusCode.BadRequest).json({ error: "Tipo inválido. Use 'expense', 'gain' ou 'investment'." });
        }
        if (error.message === "CATEGORY_ALREADY_EXISTS" || error.code === 11000) {
            return res.status(HttpStatusCode.Conflict).json({ error: "Já existe uma categoria com este nome e tipo." });
        }

        return res.status(HttpStatusCode.InternalServerError).json({ error: "Erro interno ao atualizar categoria." });
    }
}

export async function remove(req, res) {
    try {
        const { id } = req.params;
        await service.deleteCategory(id);
        return res.status(HttpStatusCode.NoContent).send();
    } catch (error) {
        console.error("Error in categoryController.remove:", error);

        if (error.message === "CATEGORY_NOT_FOUND") {
            return res.status(HttpStatusCode.NotFound).json({ error: "Categoria não encontrada." });
        }

        return res.status(HttpStatusCode.InternalServerError).json({ error: "Erro interno ao deletar categoria." });
    }
}