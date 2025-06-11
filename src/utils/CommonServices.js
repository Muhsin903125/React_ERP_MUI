import { GetSingleListResult, GetSingleResult } from "../hooks/Api";

/**
 * Base function for API calls with consistent error handling
 * @param {Function} apiCall - The API function to call
 * @param {Object} params - Parameters for the API call
 * @param {string} errorContext - Context for error logging
 * @returns {Object|null} - API response data or null if failed
 */
async function makeApiCall(apiCall, params, errorContext) {
    try {
        const { Success, Data, Message } = await apiCall(params);
        
        if (Success && Data) {
            return Data;
        }
        
        console.warn(`${errorContext} failed:`, Message);
        return null;
    } catch (error) {
        console.error(`Error in ${errorContext}:`, error);
        return null;
    }
}

/**
 * Gets the last number for a specific type
 * @param {string} type - The type identifier
 * @returns {Object|null} - Object with lastNo and IsEditable, or null if failed
 */
export async function getLastNumber(type) {
    const data = await makeApiCall(
        GetSingleResult,
        { key: "LAST_NO", TYPE: type },
        "getLastNumber"
    );
    
    if (data) {
        return {
            lastNo: data.LAST_NO,
            IsEditable: data.IS_EDITABLE
        };
    }
    
    return null;
}

/**
 * Gets all location records
 * @returns {Array|null} - Array of location records or null if failed
 */
export async function getLocationList() {
    return makeApiCall(
        GetSingleListResult,
        { key: "LOCATION_CRUD", TYPE: "GET_ALL" },
        "getLocationList"
    );
}

/**
 * Gets lookup list for a specific type
 * @param {string} type - The lookup type
 * @returns {Array|null} - Array of lookup records or null if failed
 */
export async function getLookupList(type) {
    return makeApiCall(
        GetSingleListResult,
        { key: "LOOKUP", TYPE: type },
        "getLookupList"
    );
}

/**
 * Gets all supplier records
 * @returns {Array|null} - Array of supplier records or null if failed
 */
export async function getSupplierList() {
    return makeApiCall(
        GetSingleListResult,
        { key: "SUP_CRUD", TYPE: "GET_ALL" },
        "getSupplierList"
    );
}

/**
 * Gets all unit records
 * @returns {Array|null} - Array of unit records or null if failed
 */
export async function getUnitList() {
    return makeApiCall(
        GetSingleListResult,
        { key: "UNITS_CRUD", TYPE: "GETALL" },
        "getUnitList"
    );
}

/**
 * Gets all account records
 * @returns {Array|null} - Array of account records or null if failed
 */
export async function getAccountList() {
    return makeApiCall(
        GetSingleListResult,
        { key: "COA_CRUD", TYPE: "GET_ALL_ACCOUNT" },
        "getAccountList"
    );
}

/**
 * Gets all customer records
 * @returns {Array|null} - Array of customer records or null if failed
 */
export async function getCustomerList() {
    return makeApiCall(
        GetSingleListResult,
        { key: "CUSTOMER_CRUD", TYPE: "GET_ALL" },
        "getCustomerList"
    );
}

