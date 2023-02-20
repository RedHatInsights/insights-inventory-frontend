import {
    ErrorState,
    PageHeader,
    PageHeaderTitle
} from '@redhat-cloud-services/frontend-components';
import React, { useEffect, useState } from 'react';

import { Bullseye, Spinner } from '@patternfly/react-core';
import GroupsTable from '../GroupsTable/GroupsTable';
import { getGroups } from '../InventoryGroups/utils/api';
import NoGroupsEmptyState from './NoGroupsEmptyState';

const InventoryGroups = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasGroups, setHasGroups] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(async () => {
    // make initial request to check if there is at least one group available
        try {
            const { total } = await getGroups();

            if (total > 0) {
                setHasGroups(true);
            }
        } catch (error) {
            setHasError(true);
        }

        setIsLoading(false);
    }, []);

    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title="Groups" />
            </PageHeader>
            <section className="pf-l-page__main-section pf-c-page__main-section">
                {hasError ? (
                    <ErrorState />
                ) : isLoading ? (
                    <Bullseye>
                        <Spinner />
                    </Bullseye>
                ) : hasGroups ? (
                    <GroupsTable />
                ) : (
                    <NoGroupsEmptyState />
                )}
            </section>
        </React.Fragment>
    );
};

export default InventoryGroups;
