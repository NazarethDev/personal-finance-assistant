import { User } from "../models/user/User.js"

export async function findByEmail(email) {
    return await User.findOne({ email }).select('+password');
}

export async function findById(id) {
    return await User.findById(id);
}

export async function createUser(data) {
    return await User.create(data);
}