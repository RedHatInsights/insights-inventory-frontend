import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';
import { InvalidObject } from '@redhat-cloud-services/frontend-components';
import React from 'react';
import { useSelector } from 'react-redux';

const GroupDetailInfo = () => {
    const { uninitialized, loading } = useSelector((state) => state.groupDetail);

    // TODO: implement according to mocks

    return (
        <EmptyState>
            <EmptyStateBody>
                {uninitialized || loading ? <Spinner /> : <InvalidObject />}
            </EmptyStateBody>
        </EmptyState>
    );
};

export default GroupDetailInfo;
