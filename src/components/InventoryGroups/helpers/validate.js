import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

export const nameValidator = {
  type: validatorTypes.PATTERN,
  pattern: /^[A-Za-z0-9_\-\s]+[A-Za-z0-9_\-\s]*$/,
  message:
    'Valid characters include letters, numbers, spaces, hyphens ( - ), and underscores ( _ ).',
};
