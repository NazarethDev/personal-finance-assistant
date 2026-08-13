import mongoose from "mongoose";
import { Category } from "../models/Category.js";

export async function create(data) {
    return await Category.create(data);
}

export async function findAll(type = null) {
    const query = type ? { type } : {};
    return await Category.find(query).sort({ name: 1 });
}

export async function findById(id) {
    return await Category.findById(id);
}

export async function findByIdAndType(id, type) {
    return await Category.findOne({ _id: id, type });
}

export async function update(id, data) {
    return await Category.findByIdAndUpdate(id, data, { returnDocument: "after" });
}

export async function deleteById(id) {
    return await Category.findByIdAndDelete(id);
}

export async function findByNameAndType(name, type) {
    return await Category.findOne({ name, type });
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