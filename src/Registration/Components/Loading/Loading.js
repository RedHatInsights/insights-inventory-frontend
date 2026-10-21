import { EmptyState, Spinner } from '@patternfly/react-core';

import React from 'react';

const Loading = () => (
  <EmptyState headingLevel="h4" icon={Spinner} titleText="Loading"></EmptyState>
);

export default Loading;
