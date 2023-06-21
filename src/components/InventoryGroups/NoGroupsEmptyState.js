import React, { useState } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import { global_palette_black_600 as globalPaletteBlack600 } from '@patternfly/react-tokens/dist/js/global_palette_black_600';
import CreateGroupModal from './Modals/CreateGroupModal';

const NoGroupsEmptyState = ({ reloadData }) => {
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  return (
    <EmptyState
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF4/EmptyState"
      data-ouia-safe={true}
    >
      <CreateGroupModal
        isModalOpen={createGroupModalOpen}
        setIsModalOpen={setCreateGroupModalOpen}
        reloadData={reloadData}
      />
      <EmptyStateIcon
        icon={PlusCircleIcon}
        color={globalPaletteBlack600.value}
      />
      <Title headingLevel="h4" size="lg">
        Create a system group
      </Title>
      <EmptyStateBody>
        Manage device operations efficiently by creating system groups.
      </EmptyStateBody>
      <Button variant="primary" onClick={() => setCreateGroupModalOpen(true)}>
        Create group
      </Button>
      <EmptyStateSecondaryActions>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          // TODO: component={(props) => <a href='' {...props} />}
        >
          Learn more about system groups
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

NoGroupsEmptyState.propTypes = {
  reloadData: PropTypes.func,
};

export default NoGroupsEmptyState;
