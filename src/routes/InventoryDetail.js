import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector, shallowEqual, useStore } from 'react-redux';
import './inventory.scss';
import { Link, useHistory } from 'react-router-dom';
import { entitesDetailReducer, RegistryContext } from '../store';
import * as actions from '../store/actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import { Skeleton, SkeletonSize, PageHeader, Main } from '@redhat-cloud-services/frontend-components';
import classnames from 'classnames';
import { routes } from '../Routes';
import InventoryDetailHead from '../modules/InventoryDetailHead';
import AppInfo from '../modules/AppInfo';
import DetailWrapper from '../modules/DetailWrapper';

const Inventory = ({ entity, currentApp, clearNotifications, loadEntity }) => {
    const store = useStore();
    const history = useHistory();
    const { getRegistry } = useContext(RegistryContext);
    const { loading, writePermissions } = useSelector(
        ({ permissionsReducer }) =>
            ({ loading: permissionsReducer?.loading, writePermissions: permissionsReducer?.writePermissions }),
        shallowEqual
    );

    useEffect(() => {
        insights.chrome?.hideGlobalFilter?.(true);
        insights.chrome.appAction('system-detail');
        clearNotifications();

        // BZ: RHEL cockpit is linking to crc/insights/inventory/{}/insights
        // which results in a page error, catch that and redirect
        // TODO Remove me when BZ is fixed
        const splitUrl = window.location.href.split('/insights');
        if (splitUrl.length === 3) {
            window.location = `${splitUrl[0]}/insights${splitUrl[1]}`;
        }
    }, []);

    const additionalClasses = {
        'ins-c-inventory__detail--general-info': currentApp && currentApp === 'general_information'
    };

    if (entity) {
        document.title = `${entity.display_name} | Inventory | Red Hat Insights`;
    }

    useEffect(() => {
        insights?.chrome?.appObjectId?.(entity?.id);
    }, [entity?.id]);

    return (
        <DetailWrapper
            hideInvLink
            showTags
            store={store}
            history={history}
            onLoad={({ mergeWithDetail, INVENTORY_ACTION_TYPES }) => {
                getRegistry().register(mergeWithDetail(entitesDetailReducer(INVENTORY_ACTION_TYPES)));
            }}
        >
            <PageHeader className={classnames('pf-m-light ins-inventory-detail', additionalClasses)} >
                <Breadcrumb ouiaId="systems-list">
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
                        store={store}
                        history={history}
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
                        <AppInfo
                            showTags
                            fallback=""
                            store={store}
                            history={history}
                        />
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
        clearNotifications: () => dispatch(actions.clearNotifications())
    };
}

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Inventory));
