import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

export const nameValidator = {
  type: validatorTypes.PATTERN,
  pattern: /^[A-Za-z0-9]+[A-Za-z0-9_\-\s]*$/,
  message:
    'Must start with a letter or number. Valid characters include lowercase letters, numbers, hyphens ( - ), and underscores ( _ ).',
};
