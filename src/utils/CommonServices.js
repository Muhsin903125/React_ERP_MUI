import { GetSingleResult, PostCommonSp } from "../hooks/Api";

export async function getLastNumber(type) {
    try {
        const { Success, Data, Message } = await GetSingleResult({
            "key": "LAST_NO",
            "TYPE": type,
        });

        if (Success) {
            // Safely grab the FIRST object’s LAST_NO
            const lastNo = Data?.LAST_NO;
            const IsEditable = Data?.IS_EDITABLE;
            return { lastNo, IsEditable };  // Return the last number and IsEditable
        }
    } catch (error) {
        console.error("Error:", error);
        return null; // Return null in case of an error  
    }
    return null; // Return null if not successful
};