import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useStore, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import './inventory.scss';
import { Link, useHistory } from 'react-router-dom';
import { entitesDetailReducer, RegistryContext } from '../store';
import * as actions from '../store/actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Skeleton, SkeletonSize, PageHeader, Main } from '@redhat-cloud-services/frontend-components';
import classnames from 'classnames';
import { routes } from '../Routes';
import InventoryDetailHead from '../modules/InventoryDetailHead';
import AppInfo from '../modules/AppInfo';
import DetailWrapper from '../modules/DetailWrapper';
import { useWritePermissions } from '../Utilities/constants';
import { verifyCulledInsightsClient } from '../Utilities/sharedFunctions';
import { getFact } from '../components/InventoryDetail/helpers';

const Inventory = () => {
    const { inventoryId } = useParams();
    const store = useStore();
    const history = useHistory();
    const dispatch = useDispatch();
    const { getRegistry } = useContext(RegistryContext);
    const writePermissions = useWritePermissions();
    const entityLoaded = useSelector(({ entityDetails }) => entityDetails?.loaded);
    const entity = useSelector(({ entityDetails }) => entityDetails?.entity);
    const activeApp = useSelector(({ entityDetails }) => entityDetails?.activeApp?.appName);
    const firstApp = useSelector(({ entityDetails }) => entityDetails?.activeApps?.[0]);
    const currentApp = activeApp || (firstApp && firstApp.name);
    const clearNotifications = () => dispatch(actions.clearNotifications());
    useEffect(() => {
        insights.chrome?.hideGlobalFilter?.(true);
        insights.chrome.appAction('system-detail');
        clearNotifications();
    }, []);

    const notConnected = verifyCulledInsightsClient(
        getFact('per_reporter_staleness', entity)
    );

    const additionalClasses = {
        'ins-c-inventory__detail--general-info': (currentApp && !notConnected) && currentApp === 'general_information'
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
                                    entityLoaded !== true ?
                                        <Skeleton size={SkeletonSize.xs} /> : inventoryId
                            }
                        </div>
                    </BreadcrumbItem>
                </Breadcrumb>
                {
                    <InventoryDetailHead
                        store={store}
                        history={history}
                        fallback=""
                        hideBack
                        showTags
                        hideInvLink
                        showDelete={writePermissions}
                        hideInvDrawer
                        inventoryId={inventoryId}
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
                            notConnected={notConnected}
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

export default Inventory;
