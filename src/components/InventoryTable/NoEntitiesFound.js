import React from 'react';
import {
    EmptyStateBody,
    EmptyState,
    EmptyStateVariant,
    Title,
    EmptyStateIcon,
    Button,
    EmptyStatePrimary
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

/**
 * Empty state stable when no systems (or other entities) are found.
 */
const NoEntitiesFound = ({ entities, onClearAll, showIcon }) => (
    <EmptyState
        variant={EmptyStateVariant.full}
        data-ouia-component-id="empty-state"
        data-ouia-component-type="PF4/EmptyState"
        data-ouia-safe={true}
    >
        {showIcon && <EmptyStateIcon icon={SearchIcon} />}
        <Title headingLevel="h5" size="lg">
            {`No matching ${entities} found`}
        </Title>
        <EmptyStateBody>
            To continue, edit your filter settings and try again
        </EmptyStateBody>
        {onClearAll !== undefined && (
            <EmptyStatePrimary>
                <Button variant="link" onClick={onClearAll}>
                    Clear all filters
                </Button>
            </EmptyStatePrimary>
        )}
    </EmptyState>
);

NoEntitiesFound.propTypes = {
    entities: PropTypes.string,
    onClearAll: PropTypes.func,
    showIcon: PropTypes.bool
};

NoEntitiesFound.defaultProps = {
    entities: 'systems',
    showIcon: true
};

export default NoEntitiesFound;
