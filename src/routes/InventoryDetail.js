import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useStore, useDispatch } from 'react-redux';
import { useLocation, useParams, Link, useHistory } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import './inventory.scss';
import * as actions from '../store/actions';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Skeleton, SkeletonSize } from '@redhat-cloud-services/frontend-components';
import { routes } from '../Routes';
import InventoryDetail from '../components/InventoryDetail/InventoryDetail';
import { useWritePermissions } from '../Utilities/constants';
import {
    ComplianceTab,
    VulnerabilityTab,
    AdvisorTab,
    GeneralInformationTab,
    PatchTab,
    RosTab
} from '../components/SystemDetails';

const appList = [
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
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const [activeApp] = useState(searchParams.get('appName') || appList[0].name);
    const store = useStore();
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

    const additionalClasses = {
        'ins-c-inventory__detail--general-info': activeApp === 'general_information'
    };

    if (entity) {
        document.title = `${entity.display_name} | Inventory | Red Hat Insights`;
    }

    useEffect(() => {
        insights?.chrome?.appObjectId?.(entity?.id);
    }, [entity?.id]);

    const onTabSelect = useCallback((_, activeApp, appName) => {
        searchParams.set('appName', appName);
        const search = searchParams.toString();
        history.push({
            search
        });
    }, []);

    const BreadcrumbWrapper = (<Breadcrumb ouiaId="systems-list">
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
    </Breadcrumb>);

    return (
        <InventoryDetail
            additionalClasses={additionalClasses}
            hideInvDrawer
            showDelete={writePermissions}
            hideInvLink
            hideBack
            inventoryId={inventoryId}
            showTags
            fallback=""
            store={store}
            history={history}
            isInventoryApp
            shouldWrapAsPage
            BreadcrumbWrapper={BreadcrumbWrapper}
            activeApp={activeApp}
            appList={appList}
            onTabSelect={onTabSelect}
        />
    );
};

Inventory.contextTypes = {
    store: PropTypes.object
};

export default Inventory;
