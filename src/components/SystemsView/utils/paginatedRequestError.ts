const isNotFoundError = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const responseStatus = (error as { response?: { status?: unknown } }).response
    ?.status;
  const status = (error as { status?: unknown }).status;

  return responseStatus === 404 || status === 404;
};

export const markPaginatedRequestNotFound = (error: unknown) => {
  if (!isNotFoundError(error) || typeof error !== 'object' || error === null) {
    return error;
  }

  const markedError = Object.create(Object.getPrototypeOf(error));
  Object.defineProperties(markedError, Object.getOwnPropertyDescriptors(error));
  Object.defineProperty(markedError, 'isPaginatedRequestNotFound', {
    value: true,
    enumerable: true,
  });

  return markedError;
};

export const isPaginatedRequestNotFound = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'isPaginatedRequestNotFound' in error &&
  error.isPaginatedRequestNotFound === true;
