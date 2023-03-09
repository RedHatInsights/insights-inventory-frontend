import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import NoGroupsEmptyState from '../InventoryGroups/NoGroupsEmptyState';
import GroupSystems from './GroupSystems';

const GroupSystemsWrapper = ({ groupName }) => {
    const { uninitialized, loading, data } = useSelector((state) => state.groupDetail);
    const hosts = data?.results?.[0]?.host_ids /* can be null */ || [];

    return uninitialized || loading ? (
        <EmptyState>
            <EmptyStateBody>
                <Spinner />
            </EmptyStateBody>
        </EmptyState>
    ) : hosts.length > 0 ? (
        <GroupSystems groupName={groupName}/>
    ) :
        <NoGroupsEmptyState />;
};

GroupSystemsWrapper.propTypes = {
    groupName: PropTypes.string.isRequired
};

export default GroupSystemsWrapper;
export { GroupSystems };
