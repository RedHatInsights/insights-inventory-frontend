import React from 'react';

export const INITIAL_PAGE = 1;

export const NO_HEADER = <></>;

// View name validation constants
export const VIEW_NAME_PATTERN = /^[a-zA-Z0-9 _.'-]+$/;
export const VIEW_NAME_ALPHANUMERIC_PATTERN = /.*[a-zA-Z0-9].*/;
export const MAX_VIEW_NAME_LENGTH = 255; // Backend enforced limit

export const VIEW_NAME_VALIDATION_ERRORS = {
  INVALID_CHARACTERS:
    'View name must contain only letters, numbers, spaces, hyphens, underscores, periods, and apostrophes.',
  NO_ALPHANUMERIC: 'View name must contain at least one letter or number.',
  TOO_LONG: 'View name must be 255 characters or less.',
  DUPLICATE: 'A view with this name already exists.',
} as const;
