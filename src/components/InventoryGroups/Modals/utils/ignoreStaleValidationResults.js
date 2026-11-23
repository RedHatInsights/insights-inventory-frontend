export const ignoreStaleValidationResults = (validator) => {
  let latestValidation = 0;
  let latestValidationResult;

  const validateLatest = (...args) => {
    // Data Driven Forms caches async validator results by input value. Clear
    // that cache so a value that was edited away and re-entered is checked again.
    validateLatest.cache = {};
    const validationId = ++latestValidation;
    const validationResult = Promise.resolve().then(() => validator(...args));
    latestValidationResult = validationResult;

    const guardedValidationResult = validationResult.then(
      (result) =>
        validationId === latestValidation ? result : latestValidationResult,
      (error) => {
        if (validationId === latestValidation) {
          throw error;
        }

        return latestValidationResult;
      },
    );
    latestValidationResult = guardedValidationResult;

    return guardedValidationResult;
  };

  return validateLatest;
};
