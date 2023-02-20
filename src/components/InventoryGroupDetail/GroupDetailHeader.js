import { Breadcrumb, BreadcrumbItem, Skeleton } from '@patternfly/react-core';
import {
    PageHeader,
    PageHeaderTitle
} from '@redhat-cloud-services/frontend-components';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { routes } from '../../Routes';

const GroupDetailHeader = () => {
    const { uninitialized, loading, data } = useSelector((state) => state.groupDetail);
    const { groupId } = useParams();

    const nameOrId = uninitialized || loading ? (
        <Skeleton width="250px" screenreaderText="Loading group details" />
    ) : (
        // in case of error, render just id from URL
        data?.name || groupId
    );

    return (
        <PageHeader>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link to={routes.groups}>Groups</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{nameOrId}</BreadcrumbItem>
            </Breadcrumb>
            <PageHeaderTitle title={nameOrId} />
        </PageHeader>
    );
};

export default GroupDetailHeader;
