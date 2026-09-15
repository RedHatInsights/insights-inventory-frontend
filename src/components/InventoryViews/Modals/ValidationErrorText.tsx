import React from 'react';
import {
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { VIEW_NAME_VALIDATION_ERRORS } from '../constants';
import type { ViewNameValidationError } from '../hooks/useViewNameValidation';

interface ValidationErrorTextProps {
  error: ViewNameValidationError | null;
}

export const ValidationErrorText = ({ error }: ValidationErrorTextProps) => {
  const errorMessage = error ? VIEW_NAME_VALIDATION_ERRORS[error] : null;

  if (!errorMessage) {
    return null;
  }

  return (
    <FormHelperText>
      <HelperText>
        <HelperTextItem variant="error">{errorMessage}</HelperTextItem>
      </HelperText>
    </FormHelperText>
  );
};
