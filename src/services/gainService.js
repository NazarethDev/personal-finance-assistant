import * as gainRepo from "../repositories/gainRepository.js";

async function verifyExistence(id) {
    const existsInHistory = await gainRepo.checkHistoryExists(id);
    if (existsInHistory) return 'existsInGainHistory';

    const existsInLongGain = await gainRepo.checkTemplateExists(id);
    if (existsInLongGain) return 'existsInLongGain';

    return null;
}

export async function create(data) {
    
    if (data.gainFrequency){
        return await gainRepo.saveLongGain(data);
    }

    return await gainRepo.saveShortGain(data);

}

export async function removeGain(id) {
    const target = await verifyExistence(id);

    if (!target) {
        throw new Error("GAIN_NOT_FOUND");
    }

    if (target === 'existsInGainHistory') {
        await gainRepo.deleteShortGain(id);
    } else {
        await gainRepo.deleteLongGain(id);
    }
}

export async function modifyGain(id, data) {
    const target = await verifyExistence(id);

    if (!target) {
        throw new Error("GAIN_NOT_FOUND");
    }

    if (target === 'existsInGainHistory') {
        return await gainRepo.updateShortGain(id, data);
    } else {
        return await gainRepo.updateLongGain(id, data);
    }
}