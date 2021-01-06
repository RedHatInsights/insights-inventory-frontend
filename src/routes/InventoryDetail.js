import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector, shallowEqual } from 'react-redux';
import './inventory.scss';
import '@redhat-cloud-services/frontend-components-inventory-patchman/dist/esm/index.css';
import { Link } from 'react-router-dom';
import { entitesDetailReducer } from '../store';
import * as actions from '../actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/esm/RouterParams';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/esm/Registry';
import { Skeleton, SkeletonSize, PageHeader, Main } from '@redhat-cloud-services/frontend-components';
import '@redhat-cloud-services/frontend-components-inventory-general-info/index.css';
import '@redhat-cloud-services/frontend-components-inventory-insights/index.css';
import classnames from 'classnames';
import { routes } from '../Routes';

import { InventoryDetailHead, AppInfo, DetailWrapper } from '@redhat-cloud-services/frontend-components/components/esm/Inventory';

const Inventory = ({ entity, currentApp, clearNotifications, loadEntity }) => {
    const { loading, writePermissions } = useSelector(
        ({ permissionsReducer }) =>
            ({ loading: permissionsReducer?.loading, writePermissions: permissionsReducer?.writePermissions }),
        shallowEqual
    );

    useEffect(() => {
        insights.chrome?.hideGlobalFilter?.(true);
        insights.chrome.appAction('system-detail');
        clearNotifications();
    }, []);

    const additionalClasses = {
        'ins-c-inventory__detail--general-info': currentApp && currentApp === 'general_information'
    };

    if (entity) {
        document.title = `${entity.display_name} | Inventory | Red Hat Insights`;
    }

    useEffect(() => {
        insights?.chrome?.appObjectId?.(entity?.id);
        if (entity?.id) {
            loadEntity();
        }
    }, [entity?.id]);

    return (
        <DetailWrapper
            hideInvLink
            showTags
            onLoad={({ mergeWithDetail, INVENTORY_ACTION_TYPES }) => {
                getRegistry().register(mergeWithDetail(entitesDetailReducer(INVENTORY_ACTION_TYPES)));
            }}
        >
            <PageHeader className={classnames('pf-m-light ins-inventory-detail', additionalClasses)} >
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={routes.table}>Inventory</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem isActive>
                        <div className="ins-c-inventory__detail--breadcrumb-name">
                            {
                                entity ?
                                    entity.display_name :
                                    <Skeleton size={SkeletonSize.xs} />
                            }
                        </div>
                    </BreadcrumbItem>
                </Breadcrumb>
                {
                    !loading && <InventoryDetailHead
                        fallback=""
                        hideBack
                        showTags
                        hideInvLink
                        showDelete={writePermissions}
                        hideInvDrawer
                    />
                }
            </PageHeader>
            <Main className={classnames(additionalClasses)}>
                <Grid gutter="md">
                    <GridItem span={12}>
                        <AppInfo showTags fallback="" />
                    </GridItem>
                </Grid>
            </Main>
        </DetailWrapper>
    );
};

Inventory.contextTypes = {
    store: PropTypes.object
};

Inventory.propTypes = {
    history: PropTypes.object,
    entity: PropTypes.object,
    loadEntity: PropTypes.func,
    clearNotifications: PropTypes.func,
    currentApp: PropTypes.string
};

function mapStateToProps({ entityDetails }) {
    const activeApp = entityDetails && entityDetails.activeApp && entityDetails.activeApp.appName;
    const firstApp = entityDetails && entityDetails.activeApps && entityDetails.activeApps[0];
    return {
        entity: entityDetails && entityDetails.entity,
        currentApp: activeApp || (firstApp && firstApp.name)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadEntity: () => dispatch(actions.loadEntity()),
        clearNotifications: () => dispatch(actions.clearNotifications())
    };
}

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Inventory));
