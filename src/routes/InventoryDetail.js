import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useStore, useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import './inventory.scss';
import { Link, useHistory } from 'react-router-dom';
import * as actions from '../store/actions';
import { Grid, GridItem } from '@patternfly/react-core';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Skeleton, SkeletonSize, PageHeader, Main } from '@redhat-cloud-services/frontend-components';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import classnames from 'classnames';
import { routes } from '../Routes';
import InventoryDetailHead from '../modules/InventoryDetailHead';
import AppInfo from '../modules/AppInfo';
import DetailWrapper from '../modules/DetailWrapper';
import { useWritePermissions } from '../Utilities/constants';
import {
    ComplianceTab,
    VulnerabilityTab,
    AdvisorTab,
    GeneralInformationTab,
    PatchTab,
    RosTab
} from '../components/SystemDetails';

const activeApps = [
    { title: 'General information', name: 'general_information', component: GeneralInformationTab },
    { title: 'Advisor', name: 'advisor', component: AdvisorTab },
    {
        title: 'Vulnerability',
        name: 'vulnerabilities',
        component: VulnerabilityTab
    },
    {
        title: 'Compliance',
        name: 'compliance',
        component: ComplianceTab
    },
    {
        title: 'Patch',
        name: 'patch',
        component: PatchTab
    },
    {
        title: 'Resource Optimization',
        name: 'ros',
        isVisible: false,
        component: RosTab
    }
];

const Inventory = () => {
    const chrome = useChrome();
    const { inventoryId } = useParams();
    const [activeApp, setActiveApp] = useState(activeApps[0]);
    const store = useStore();
    const { search } = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    const writePermissions = useWritePermissions();
    const entityLoaded = useSelector(({ entityDetails }) => entityDetails?.loaded);
    const entity = useSelector(({ entityDetails }) => entityDetails?.entity);
    const clearNotifications = () => dispatch(actions.clearNotifications());
    useEffect(() => {
        chrome?.hideGlobalFilter?.(true);
        chrome.appAction('system-detail');
        clearNotifications();
    }, []);

    const searchParams = new URLSearchParams(search);

    const additionalClasses = {
        'ins-c-inventory__detail--general-info': activeApp?.name === 'general_information'
    };

    if (entity) {
        document.title = `${entity.display_name} | Inventory | Red Hat Insights`;
    }

    useEffect(() => {
        if (search) {
            setActiveApp(activeApps.find(({ name }) => name === searchParams.get('appName')));
        }
    }, [search]);

    useEffect(() => {
        insights?.chrome?.appObjectId?.(entity?.id);
    }, [entity?.id]);

    return (
        <DetailWrapper
            hideInvLink
            showTags
            store={store}
            history={history}
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
                                        <Skeleton size={SkeletonSize.xs} /> : entity?.id
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
                        appList={activeApps}
                        inventoryId={inventoryId}
                        onTabSelect={(_e, tabId) => {
                            history.push({ search: `appName=${tabId}` });
                            setActiveApp(activeApps.find(({ name }) => name === tabId));
                        }}
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
                            activeApp={activeApp}
                            componentMapper={activeApp?.component}
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
