/**
 * Utility functions to parse and handle backend validation errors
 */

/**
 * Parses backend error response and extracts field-specific errors
 * @param {Object} errorResponse - The error response from axios
 * @returns {Object} - Object with field errors and general message
 */
export const parseBackendErrors = (errorResponse) => {
  const fieldErrors = {};
  let generalMessage = '';
  let generalErrors = [];

  if (!errorResponse) {
    return { fieldErrors, generalMessage: 'An unexpected error occurred', generalErrors };
  }

  const data = errorResponse.data || errorResponse;

  // Handle ASP.NET Core ModelState format
  // Format: { "Email": ["Email is required"], "Password": ["Password must be at least 6 characters"] }
  if (data && typeof data === 'object') {
    // Check if it's ModelState format (keys are field names, values are arrays of errors)
    const isModelStateFormat = Object.keys(data).some(key => 
      Array.isArray(data[key]) || 
      (data[key] && typeof data[key] === 'object' && Array.isArray(data[key].errors))
    );

    if (isModelStateFormat) {
      Object.keys(data).forEach(key => {
        // Skip non-field keys like 'message', 'errorType', etc.
        if (['message', 'errorType', 'errors', 'details', 'success'].includes(key)) {
          return;
        }

        let errors = [];
        if (Array.isArray(data[key])) {
          errors = data[key];
        } else if (data[key] && Array.isArray(data[key].errors)) {
          errors = data[key].errors;
        } else if (typeof data[key] === 'string') {
          errors = [data[key]];
        }

        if (errors.length > 0) {
          // Map backend field names to frontend field names (PascalCase to camelCase)
          const frontendFieldName = mapBackendFieldToFrontend(key);
          fieldErrors[frontendFieldName] = errors[0]; // Take first error for each field
        }
      });
    }

    // Handle custom error format: { message: "...", errors: [...] }
    if (data.message) {
      generalMessage = data.message;
    }

    if (Array.isArray(data.errors)) {
      generalErrors = data.errors;
      if (!generalMessage && data.errors.length > 0) {
        generalMessage = data.errors[0];
      }
    }
  }

  // If no field errors found but there's a message, use it as general message
  if (Object.keys(fieldErrors).length === 0 && generalMessage) {
    // Try to extract field name from message if it's a validation error
    const fieldMatch = generalMessage.match(/(\w+)\s+(is required|is invalid|must be|should be)/i);
    if (fieldMatch) {
      const fieldName = fieldMatch[1].toLowerCase();
      const frontendFieldName = mapBackendFieldToFrontend(fieldName);
      fieldErrors[frontendFieldName] = generalMessage;
    }
  }

  return {
    fieldErrors,
    generalMessage: generalMessage || 'An error occurred. Please try again.',
    generalErrors
  };
};

/**
 * Maps backend field names (PascalCase) to frontend field names (camelCase)
 * @param {string} backendField - Backend field name (e.g., "Email", "FirstName")
 * @returns {string} - Frontend field name (e.g., "email", "firstName")
 */
const mapBackendFieldToFrontend = (backendField) => {
  const mapping = {
    'Email': 'email',
    'Password': 'password',
    'ConfirmPassword': 'confirmPassword',
    'FirstName': 'firstName',
    'LastName': 'lastName',
    'Role': 'role',
    'Token': 'token',
    'NewPassword': 'newPassword',
    'CurrentPassword': 'currentPassword',
    'UserName': 'userName',
    'PhoneNumber': 'phoneNumber'
  };

  // Direct mapping
  if (mapping[backendField]) {
    return mapping[backendField];
  }

  // Convert PascalCase to camelCase
  if (backendField && backendField.length > 0) {
    return backendField.charAt(0).toLowerCase() + backendField.slice(1);
  }

  return backendField.toLowerCase();
};

/**
 * Extracts error message from axios error
 * @param {Error} error - Axios error object
 * @returns {string} - Error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Axios error
  if (error.response) {
    const data = error.response.data;
    if (data?.message) {
      return data.message;
    }
    if (typeof data === 'string') {
      return data;
    }
    if (Array.isArray(data?.errors)) {
      return data.errors[0];
    }
    return error.response.statusText || `Error ${error.response.status}`;
  }

  // Network error
  if (error.request) {
    return 'Network error. Please check your connection.';
  }

  // Other error
  return error.message || 'An unexpected error occurred';
};

