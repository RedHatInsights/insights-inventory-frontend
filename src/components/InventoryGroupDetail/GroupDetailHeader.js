import { Breadcrumb, BreadcrumbItem, Skeleton } from '@patternfly/react-core';
import {
    PageHeader,
    PageHeaderTitle
} from '@redhat-cloud-services/frontend-components';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { routes } from '../../Routes';
import PropTypes from 'prop-types';

const GroupDetailHeader = ({ groupId }) => {
    const { uninitialized, loading, data } = useSelector((state) => state.groupDetail);

    const nameOrId = uninitialized || loading ? (
        <Skeleton width="250px" screenreaderText="Loading group details" />
    ) : (
        // in case of error, render just id from URL
        data?.results?.[0]?.name || groupId
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

GroupDetailHeader.propTypes = {
    groupId: PropTypes.string.isRequired
};

export default GroupDetailHeader;
