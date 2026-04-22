import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import NoSystemsEmptyState from '../InventoryGroupDetail/NoSystemsEmptyState';
import GroupSystems from './GroupSystems';

const GroupSystemsWrapper = ({
  groupName,
  groupId,
  ungrouped,
  workspaceAccess,
}) => {
  const { uninitialized, loading, data } = useSelector(
    (state) => state.groupDetail,
  );
  return uninitialized || loading ? (
    <EmptyState>
      <EmptyStateBody>
        <Spinner />
      </EmptyStateBody>
    </EmptyState>
  ) : (data?.results?.[0]?.host_count || 0) > 0 ? (
    <GroupSystems
      groupId={groupId}
      groupName={groupName}
      ungrouped={ungrouped ?? false}
      workspaceAccess={workspaceAccess}
    />
  ) : (
    <NoSystemsEmptyState
      groupId={groupId}
      groupName={groupName}
      workspaceAccess={workspaceAccess}
    />
  );
};

GroupSystemsWrapper.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  ungrouped: PropTypes.bool,
  workspaceAccess: PropTypes.shape({
    canEdit: PropTypes.bool,
    isLoading: PropTypes.bool,
    gateActive: PropTypes.bool,
  }),
};

export default GroupSystemsWrapper;
export { GroupSystems };
