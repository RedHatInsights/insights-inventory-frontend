import { DEFAULT_DELETE_ERROR_MESSAGE } from '../../../constants';

/**
 * Extracts a user-facing error description from an error or API response.
 * Handles axios errors (error.response.data.detail), API response objects,
 * and array of responses (uses first item).
 *
 *  @param errorOrResponse - The thrown error, API response object, or array of responses
 *  @returns               User-facing error message string, or default message if none found
 */
export function getDeleteErrorDescription(errorOrResponse: unknown): string {
  if (errorOrResponse == null) {
    return DEFAULT_DELETE_ERROR_MESSAGE;
  }

  const err = Array.isArray(errorOrResponse)
    ? errorOrResponse[0]
    : errorOrResponse;

  const detail =
    (err as { response?: { data?: { detail?: unknown } } })?.response?.data
      ?.detail ??
    (err as { data?: { detail?: unknown } })?.data?.detail ??
    (err as { detail?: unknown })?.detail;

  if (detail == null) {
    return DEFAULT_DELETE_ERROR_MESSAGE;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (typeof detail === 'object' && detail !== null && !Array.isArray(detail)) {
    try {
      return JSON.stringify(detail);
    } catch {
      return DEFAULT_DELETE_ERROR_MESSAGE;
    }
  }

  return String(detail);
}
