import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import NoSystemsEmptyState from '../InventoryGroupDetail/NoSystemsEmptyState';
import GroupSystems from './GroupSystems';

const GroupSystemsWrapper = ({ groupName, groupId, immutable }) => {
  const { uninitialized, loading, data } = useSelector(
    (state) => state.groupDetail
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
      immutable={immutable}
    />
  ) : (
    <NoSystemsEmptyState groupId={groupId} groupName={groupName} />
  );
};

GroupSystemsWrapper.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  immutable: PropTypes.bool,
};

export default GroupSystemsWrapper;
export { GroupSystems };
