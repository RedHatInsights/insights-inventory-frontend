import React from 'react';
import {
    PageHeader,
    PageHeaderTitle
} from '@redhat-cloud-services/frontend-components';
import NoGroupsEmptyState from './NoGroupsEmptyState';

const InventoryGroups = () => {
    return (
        <React.Fragment>
            <PageHeader>
                <PageHeaderTitle title="Groups" />
            </PageHeader>
            <section className="pf-l-page__main-section pf-c-page__main-section">
                <NoGroupsEmptyState />
            </section>
        </React.Fragment>
    );
};

export default InventoryGroups;
