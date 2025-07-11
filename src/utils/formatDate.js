import dayjs from 'dayjs';

/**
 * Extracts date part from ISO datetime string or Date object
 * @param {string|Date} dateValue - Date value in any format
 * @returns {string} - Date in YYYY-MM-DD format or empty string if invalid
 */
export const extractDateOnly = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    // Handle ISO datetime strings like "2025-06-01T00:00:00" or "2025-06-01T00:00:00.000Z"
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      const datePart = dateValue.split('T')[0];
      console.log('extractDateOnly input:', dateValue, 'extracted:', datePart); // Debug log
      return datePart;
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      const result = dayjs(dateValue).format('YYYY-MM-DD');
      console.log('extractDateOnly Date object:', dateValue, 'extracted:', result); // Debug log
      return result;
    }
    
    // Handle other date formats using dayjs
    const parsed = dayjs(dateValue);
    const result = parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
    console.log('extractDateOnly other format:', dateValue, 'extracted:', result); // Debug log
    return result;
  } catch (error) {
    console.warn('Date parsing error:', error);
    return '';
  }
};

/**
 * Formats date to any custom format
 * @param {string|Date} dateValue - Date value in any format
 * @param {string} format - Desired format (e.g., 'DD-MMM-YYYY', 'DD-MM-YYYY')
 * @returns {string} - Formatted date or empty string if invalid
 */
export const formatDateCustom = (dateValue, format = 'DD-MM-YYYY') => {
  if (!dateValue) return '';
  
  try {
    // First extract date only if it's an ISO string
    const dateOnly = extractDateOnly(dateValue);
    const parsed = dayjs(dateOnly || dateValue);
    const result = parsed.isValid() ? parsed.format(format) : '';
    console.log('formatDateCustom input:', dateValue, 'format:', format, 'result:', result); // Debug log
    return result;
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '';
  }
};


/**
 * Formats date to DD-MM-YYYY format for display
 * @param {string|Date} dateValue - Date value in any format
 * @returns {string} - Date in DD-MM-YYYY format or empty string if invalid
 */
export const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    // First extract date only if it's an ISO string
    const dateOnly = extractDateOnly(dateValue);
    
    const parsed = dayjs(dateOnly || dateValue);
    const result = parsed.isValid() ? parsed.format('DD-MM-YYYY') : ''; 
    return result;
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '';
  }
};

/**
 * Validates if a date value is valid
 * @param {string|Date} dateValue - Date value to validate
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  
  try {
    const dateOnly = extractDateOnly(dateValue);
    return dayjs(dateOnly || dateValue).isValid();
  } catch (error) {
    return false;
  }
};
