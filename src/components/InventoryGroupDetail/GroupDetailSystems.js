import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';
import React from 'react';
import { useSelector } from 'react-redux';
import NoSystemsEmptyState from './NoSystemsEmptyState';

const GroupDetailSystems = () => {
    const { uninitialized, loading } = useSelector((state) => state.groupDetail);

    // TODO: integrate the inventory table

    return (uninitialized || loading ?
        <EmptyState>
            <EmptyStateBody>
                <Spinner />
            </EmptyStateBody>
        </EmptyState>
        : <NoSystemsEmptyState />

    );
};

export default GroupDetailSystems;
