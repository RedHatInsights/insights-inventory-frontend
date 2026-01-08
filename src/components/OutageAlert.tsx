import React from 'react';

import { Alert } from '@patternfly/react-core';
import { useFeatureVariant } from '../Utilities/useFeatureFlag';

export const OutageAlert = () => {
  const {
    isEnabled,
    body: body = '',
    variant: variant = 'danger',
    title:
      title = 'The Inventory service is currently unavailable. Please check back later.',
  } = useFeatureVariant('hbi.outage-banner');

  if (!isEnabled) {
    return null;
  }

  return (
    <Alert title={title} variant={variant}>
      {body}
    </Alert>
  );
};
