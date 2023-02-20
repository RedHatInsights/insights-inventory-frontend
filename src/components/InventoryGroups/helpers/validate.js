import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';

export const nameValidator = {
    type: validatorTypes.PATTERN,
    pattern: /^[A-Za-z0-9]+[A-Za-z0-9_\-\s]*$/,
    message:
      'Name must start with alphanumeric characters and can contain underscore and hyphen characters.'
};
