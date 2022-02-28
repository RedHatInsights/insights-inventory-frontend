import React from 'react';
import { EmptyStateBody, EmptyState, EmptyStateVariant, Title } from '@patternfly/react-core';

/**
 * Empty state stable when no systems are found.
 */
const NoSystemsTable = () => (
    <EmptyState variant={ EmptyStateVariant.full }>
        <Title headingLevel="h5" size="lg">
            No matching systems found
        </Title>
        <EmptyStateBody>
            To continue, edit your filter settings and search again.
        </EmptyStateBody>
    </EmptyState>
);

export default NoSystemsTable;
