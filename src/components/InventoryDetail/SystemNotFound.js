import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
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
      <EmptyStateIcon icon={CubesIcon} />
      <Title headingLevel="h5" size="lg">
        System not found
      </Title>
      <EmptyStateBody>
        System with ID {inventoryId} does not exist
      </EmptyStateBody>
      <Button
        variant="primary"
        onClick={() =>
          redirectToInventoryList(inventoryId, onBackToListClick, navigate)
        }
      >
        Back to previous page
      </Button>
    </EmptyState>
  );
};

SystemNotFound.propTypes = {
  inventoryId: PropTypes.string,
  onBackToListClick: PropTypes.func,
};

export default SystemNotFound;
