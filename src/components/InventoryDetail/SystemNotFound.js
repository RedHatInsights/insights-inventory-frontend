import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/js/icons/cubes-icon';
import { redirectToInventoryList } from './helpers';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';

/**
 * Empty state when system was not found in inventory.
 * @param {*} params - inventoryId and onBackToListClick.
 */
const SystemNotFound = ({ inventoryId, onBackToListClick }) => {
  const navigate = useInsightsNavigate();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateHeader
        titleText="System not found"
        icon={<EmptyStateIcon icon={CubesIcon} />}
        headingLevel="h5"
      />
      <EmptyStateBody>
        System with ID {inventoryId} does not exist
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          variant="primary"
          onClick={() =>
            redirectToInventoryList(inventoryId, onBackToListClick, navigate)
          }
        >
          Back to previous page
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

SystemNotFound.propTypes = {
  inventoryId: PropTypes.string,
  onBackToListClick: PropTypes.func,
};

export default SystemNotFound;
