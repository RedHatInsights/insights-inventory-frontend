import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

/**
 * Empty state stable when no systems (or other entities) are found.
 *  @param   {object}     props            props object
 *  @param   {string}     props.entities   entities count (systems, workspaces, etc.)
 *  @param   {Function}   props.onClearAll on clear all function
 *  @param   {boolean}    props.showIcon   if true, the icon is shown
 *  @returns {React.node}                  React node with empty state
 */
const NoEntitiesFound = ({ entities, onClearAll, showIcon }) => (
  <EmptyState
    headingLevel="h5"
    titleText={<>{`No matching ${entities} found`}</>}
    variant={EmptyStateVariant.full}
    data-ouia-component-id="empty-state"
    data-ouia-component-type="PF6/EmptyState"
    data-ouia-safe={true}
    icon={showIcon && SearchIcon}
  >
    <EmptyStateBody>
      To continue, edit your filter settings and try again
    </EmptyStateBody>
    <EmptyStateFooter>
      {onClearAll !== undefined && (
        <EmptyStateActions>
          <Button variant="link" onClick={onClearAll}>
            Clear all filters
          </Button>
        </EmptyStateActions>
      )}
    </EmptyStateFooter>
  </EmptyState>
);

NoEntitiesFound.propTypes = {
  entities: PropTypes.string,
  onClearAll: PropTypes.func,
  showIcon: PropTypes.bool,
};

NoEntitiesFound.defaultProps = {
  entities: 'systems',
  showIcon: true,
};

export default NoEntitiesFound;
