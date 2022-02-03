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
            This filter criteria matches no systems. <br /> Try changing your filter settings.
        </EmptyStateBody>
    </EmptyState>
);

export default NoSystemsTable;
