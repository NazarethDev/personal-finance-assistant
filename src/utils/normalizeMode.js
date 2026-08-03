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