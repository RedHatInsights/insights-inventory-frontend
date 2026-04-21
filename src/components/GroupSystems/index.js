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
  workspaceKesselCanEdit,
  workspaceKesselPermissionsLoading,
  workspaceKesselGateActive,
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
      workspaceKesselCanEdit={workspaceKesselCanEdit}
      workspaceKesselPermissionsLoading={workspaceKesselPermissionsLoading}
      workspaceKesselGateActive={workspaceKesselGateActive}
    />
  ) : (
    <NoSystemsEmptyState
      groupId={groupId}
      groupName={groupName}
      workspaceKesselCanEdit={workspaceKesselCanEdit}
      workspaceKesselPermissionsLoading={workspaceKesselPermissionsLoading}
      workspaceKesselGateActive={workspaceKesselGateActive}
    />
  );
};

GroupSystemsWrapper.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  ungrouped: PropTypes.bool,
  workspaceKesselCanEdit: PropTypes.bool,
  workspaceKesselPermissionsLoading: PropTypes.bool,
  workspaceKesselGateActive: PropTypes.bool,
};

export default GroupSystemsWrapper;
export { GroupSystems };
