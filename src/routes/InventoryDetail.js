import React, { useState, Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useStore } from 'react-redux';
import './inventory.scss';
import { Link } from 'react-router-dom';
import { entitesDetailReducer, addNewListener } from '../store';
import * as actions from '../actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { asyncInventoryLoader } from '../components/inventory/AsyncInventory';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/files/RouterParams';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { Skeleton, SkeletonSize, PageHeader, Main } from '@redhat-cloud-services/frontend-components';
import '@redhat-cloud-services/frontend-components-inventory-general-info/index.css';
import '@redhat-cloud-services/frontend-components-inventory-insights/index.css';
import '@redhat-cloud-services/frontend-components-inventory-vulnerabilities/dist/cjs/index.css';
import { SystemCvesStore } from '@redhat-cloud-services/frontend-components-inventory-vulnerabilities/dist/cjs/SystemCvesStore';
import { SystemAdvisoryListStore } from '@redhat-cloud-services/frontend-components-inventory-patchman/dist/esm';
import classnames from 'classnames';
import { routes } from '../Routes';

const Inventory = ({ entity, currentApp, clearNotifications, loadEntity }) => {
    const [ConnectedInventory, setInventory] = useState({});
    const store = useStore();
    const { InventoryDetail, AppInfo, DetailWrapper } = ConnectedInventory;

    const loadInventory = async () => {
        clearNotifications();
        const {
            inventoryConnector,
            INVENTORY_ACTION_TYPES,
            mergeWithDetail
        } = await asyncInventoryLoader();
        getRegistry().register(mergeWithDetail(entitesDetailReducer(INVENTORY_ACTION_TYPES)));

        const removeListener = addNewListener({
            actionType: INVENTORY_ACTION_TYPES.LOAD_ENTITY,
            callback: ({ data }) => {
                data.then(payload => {
                    loadEntity(payload.results[0].id);
                    removeListener();
                });
            }
        });

        const { InventoryDetailHead, AppInfo, DetailWrapper } = inventoryConnector(store);

        SystemCvesStore && getRegistry().register({ SystemCvesStore });
        SystemAdvisoryListStore && getRegistry().register({ SystemAdvisoryListStore });

        setInventory({
            InventoryDetail: InventoryDetailHead,
            AppInfo,
            DetailWrapper
        });
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const additionalClasses = {
        'ins-c-inventory__detail--general-info': currentApp && currentApp === 'general_information'
    };

    const Wrapper = DetailWrapper || Fragment;

    return (
        <Wrapper
            hideInvLink
            showTags
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
                    InventoryDetail &&
                    <InventoryDetail
                        hideBack
                        showTags
                        hideInvLink
                        showDelete
                        hideInvDrawer
                    />
                }
            </PageHeader>
            <Main className={classnames(additionalClasses)}>
                <Grid gutter="md">
                    <GridItem span={12}>
                        {AppInfo && <AppInfo showTags />}
                    </GridItem>
                </Grid>
            </Main>
        </Wrapper>
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
        loadEntity: (id) => dispatch(actions.loadEntity(id)),
        clearNotifications: () => dispatch(actions.clearNotifications())
    };
}

export default routerParams(connect(mapStateToProps, mapDispatchToProps)(Inventory));
