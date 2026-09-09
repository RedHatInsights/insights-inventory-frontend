import type { ViewOut } from '../../../api/inventoryViewsApi';
import {
  VIEW_NAME_PATTERN,
  VIEW_NAME_ALPHANUMERIC_PATTERN,
  MAX_VIEW_NAME_LENGTH,
  VIEW_NAME_VALIDATION_ERRORS,
} from '../constants';

export type ViewNameValidationError = keyof typeof VIEW_NAME_VALIDATION_ERRORS;

export const validateViewName = (
  viewsList: ViewOut[],
  name: string,
  options?: { excludeViewId?: string },
) => {
  const trimmedName = name.trim();

  // Check if name is empty
  if (trimmedName.length === 0) {
    return {
      isValid: false,
      validated: 'default' as const,
      error: null,
    };
  }

  // Check max length (backend limit is 255)
  if (trimmedName.length > MAX_VIEW_NAME_LENGTH) {
    return {
      isValid: false,
      validated: 'error' as const,
      error: 'TOO_LONG' as ViewNameValidationError,
    };
  }

  // Check for invalid characters
  if (!VIEW_NAME_PATTERN.test(trimmedName)) {
    return {
      isValid: false,
      validated: 'error' as const,
      error: 'INVALID_CHARACTERS' as ViewNameValidationError,
    };
  }

  // Check for at least one alphanumeric character
  if (!VIEW_NAME_ALPHANUMERIC_PATTERN.test(trimmedName)) {
    return {
      isValid: false,
      validated: 'error' as const,
      error: 'NO_ALPHANUMERIC' as ViewNameValidationError,
    };
  }

  // Check for duplicate names
  const isDuplicate = viewsList.some(
    (v) =>
      v.name.toLowerCase() === trimmedName.toLowerCase() &&
      v.id !== options?.excludeViewId,
  );

  if (isDuplicate) {
    return {
      isValid: false,
      validated: 'error' as const,
      error: 'DUPLICATE' as ViewNameValidationError,
    };
  }

  return {
    isValid: true,
    validated: 'success' as const,
    error: null,
  };
};
