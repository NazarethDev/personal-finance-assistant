import { operationMode } from "../models/operationModeEnum.js";

export function normalizeMode(mode) {
    const normalized =
        typeof mode === "string"
            ? mode.toUpperCase()
            : operationMode.SINGLE;

    return Object.values(operationMode).includes(normalized)
        ? normalized
        : operationMode.SINGLE;
}

export function validateOperationMode(mode) {
    if (!mode) {
        return operationMode.SINGLE;
    }

    const normalizedMode = typeof mode === "string" ? mode.trim().toUpperCase() : null;

    if (!normalizedMode || !Object.values(operationMode).includes(normalizedMode)) {
        throw new Error("INVALID_OPERATION_MODE");
    }

    return normalizedMode;
}