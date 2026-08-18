import * as repo from "../repositories/categoryRepository.js";

const VALID_TYPES = ["expense", "gain", "investment"];

function normalizeType(type) {
    if (typeof type !== "string") {
        throw new Error("INVALID_CATEGORY_TYPE");
    }

    const normalizedType = type.toLowerCase().trim();

    if (!VALID_TYPES.includes(normalizedType)) {
        throw new Error("INVALID_CATEGORY_TYPE");
    }

    return normalizedType;
}

export async function createCategory({ userId, name, type }) {
    if (!name || !type) {
        throw new Error("NAME_AND_TYPE_REQUIRED");
    }

    const normalizedType = normalizeType(type);
    const normalizedName = String(name).trim().toLowerCase();

    const categoryExists = await repo.findByNameAndType(userId, normalizedName, normalizedType);
    if (categoryExists) {
        throw new Error("CATEGORY_ALREADY_EXISTS");
    }

    return await repo.create({
        user: userId,
        name: normalizedName,
        type: normalizedType
    });
}

export async function getCategories(userId, type) {
    if (type) {
        const normalizedType = normalizeType(type);
        return await repo.findAll(userId, normalizedType);
    }

    return await repo.findAll(userId);
}

export async function getCategoryById(userId, id) {
    const category = await repo.findById(userId, id);

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    return category;
}

export async function updateCategory({ userId, id, name, type }) {
    const categoryExists = await repo.findById(userId, id);

    if (!categoryExists) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    const updateData = {};

    if (name !== undefined) {
        updateData.name = String(name).trim().toLowerCase();
    }

    if (type !== undefined) {
        updateData.type = normalizeType(type);
    }

    const targetName = updateData.name ?? categoryExists.name;
    const targetType = updateData.type ?? categoryExists.type;

    if (targetName !== categoryExists.name || targetType !== categoryExists.type) {
        const duplicate = await repo.findByNameAndType(userId, targetName, targetType);
        if (duplicate && duplicate._id.toString() !== id) {
            throw new Error("CATEGORY_ALREADY_EXISTS");
        }
    }

    return await repo.update(userId, id, updateData);
}

export async function deleteCategory(userId, id) {
    const category = await repo.findById(userId, id);

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    return await repo.deleteById(userId, id);
}