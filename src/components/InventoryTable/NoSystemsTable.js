import React from 'react';
import {
    EmptyStateBody,
    EmptyState,
    EmptyStateVariant,
    Title
} from '@patternfly/react-core';

/**
 * Empty state stable when no systems are found.
 */
const NoSystemsTable = () => (
    <EmptyState
        variant={EmptyStateVariant.full}
        data-ouia-component-id="empty-state"
        data-ouia-component-type="PF4/EmptyState"
        data-ouia-safe={true}
    >
        <Title headingLevel="h5" size="lg">
            No matching systems found
        </Title>
        <EmptyStateBody>
            To continue, edit your filter settings and search again.
        </EmptyStateBody>
    </EmptyState>
);

export default NoSystemsTable;
