import { GetSingleListResult, GetSingleResult, PostCommonSp } from "../hooks/Api";

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


export async function getLocationList() {
    try {
        const { Success, Data, Message } = await GetSingleListResult({
            "key": "LOCATION_CRUD",
            "TYPE": "GET_ALL",
        });

        if (Success) {
            console.log("Data", Data);
            // Safely grab the FIRST object’s LAST_NO
            return Data;
        }
    } catch (error) {
        console.error("Error:", error);
        return null; // Return null in case of an error  
    }
    return null; // Return null if not successful
};

export async function GetLookupList(type) {
    try {
        const { Success, Data, Message } = await GetSingleListResult({
            key: 'LOOKUP',
            TYPE: type,   
        });

        if (Success) {
            return Data;
        }
    } catch (error) {
        console.error("Error:", error);
        return null; // Return null in case of an error  
    }
    return null; // Return null if not successful
}




export async function getSupplierList() {
    try {
        const { Success, Data, Message } = await GetSingleListResult({
            "key": "SUP_CRUD",
            "TYPE": "GET_ALL",
        });

        if (Success) {
            console.log("Data", Data);
            // Safely grab the FIRST object’s LAST_NO
            return Data;
        }
    } catch (error) {
        console.error("Error:", error);
        return null; // Return null in case of an error  
    }
    return null; // Return null if not successful
};

export async function getUnitList() {
    try {
        const { Success, Data, Message } = await GetSingleListResult({
            "key": "UNITS_CRUD", 
            "TYPE": "GETALL",
        });

        if (Success) {
            return Data;
        }
    } catch (error) {
        console.error("Error:", error);
        return null; // Return null in case of an error  
    }
    return null; // Return null if not successful
}   

