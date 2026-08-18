import mongoose from "mongoose";
import { Category } from "../models/Category.js";

export async function create(data) {
    return await Category.create(data);
}

export async function findAll(userId, type = null) {
    const query = type ? { user: userId, type } : { user: userId };
    return await Category.find(query).sort({ name: 1 });
}

export async function findById(userId, id) {
    return await Category.findOne({ user: userId, _id: id });
}

export async function findByIdAndType(userId, id, type) {
    return await Category.findOne({ user: userId, _id: id, type });
}

export async function update(userId, id, data) {
    return await Category.findOneAndUpdate(
        { user: userId, _id: id },
        data,
        { returnDocument: "after" }
    );
}

export async function deleteById(userId, id) {
    return await Category.findOneAndDelete({ user: userId, _id: id });
}

export async function findByNameAndType(userId, name, type) {
    return await Category.findOne({ user: userId, name, type });
}

export async function findByIdOrNameAndType(identifier, type, userId) {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    const query = {
        user: userId,
        type: type
    };

    if (isObjectId) {
        query._id = identifier;
    } else {
        query.name = { $regex: new RegExp(`^${identifier}$`, "i") };
    }

    return await Category.findOne(query);
}