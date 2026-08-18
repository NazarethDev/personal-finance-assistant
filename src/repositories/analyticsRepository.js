import { Gain } from "../models/gainsModels/Gain.js";
import { Types } from "mongoose";

export const fetchAllFinancialDataInSingleQuery = async (startDate, endDate) => {

    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
    const dateMatchFilter = {
        userId: userObjectId,
        dueDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    };

    const combinedData = await Gain.aggregate([
        { $match: dateMatchFilter },
        { $addFields: { collectionType: 'GAIN' } },

        {
            $unionWith: {
                coll: 'expenses',
                pipeline: [
                    { $match: dateMatchFilter },
                    { $addFields: { collectionType: 'EXPENSE' } }
                ]
            }
        },

        {
            $unionWith: {
                coll: 'investments',
                pipeline: [
                    { $match: dateMatchFilter },
                    { $addFields: { collectionType: 'INVESTMENT' } }
                ]
            }
        }
    ]);

    const gains = combinedData.filter(item => item.collectionType === 'GAIN');
    const expenses = combinedData.filter(item => item.collectionType === 'EXPENSE');
    const investments = combinedData.filter(item => item.collectionType === 'INVESTMENT');

    return {
        gains,
        expenses,
        investments,
        rawCombined: combinedData
    };
};