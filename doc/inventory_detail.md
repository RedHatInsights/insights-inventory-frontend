# Inventory detail 
As of v1.3.1 you can render the inventory header and main section separately, rather than using obsolete AppInfo and InventoryDetailHead components to render the tab menu and main section separately (doc/inventory_detail.md). 

# Detail wrapper
This component serves as a wrapper for Inventory detail page components. It wrapps components with a drawer. 

IMPORTANT: inventoryId is a required prop that will be used to fetch inventory detail data from the inventory API. This data can be used to populate the header and main section later by accessing it from the redux

# InventoryDetail

This is the main component that renders both header and main section. It adds deleteEntity action and an error handling. 

Note: you can pass a custom appList prop as an array of tabs to render in the main section. To do this you need to pass showMainSection as true together with the appList prop.

```JSX 

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
import { AdvisorTab, GeneralInformationTab } from '../components/SystemDetails';

const appList = [
    { title: 'General information', name: 'general_information', component: eneralInformationTab },
    { title: 'Advisor', name: 'advisor', component: AdvisorTab }
];

const BreadcrumbWrapper = () => (
    <Breadcrumb ouiaId="systems-list">
        <BreadcrumbItem>
            <Link to={routes.table}>Inventory</Link>
        </BreadcrumbItem>
    </Breadcrumb>
);

const Inventory = () => {
    const { inventoryId } = useParams();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const [activeApp] = useState(searchParams.get('appName') || appList[0].name);
    const store = useStore();
    const history = useHistory();

    const onTabSelect = useCallback((_, activeApp, appName) => {
        searchParams.set('appName', appName);
        const search = searchParams.toString();
        history.push({
            search
        });
    }, [searchParams]);

    return (
        <InventoryDetail
            additionalClasses={additionalClasses}
            hideInvDrawer
            showDelete={writePermissions}
            hideInvLink
            hideBack
            inventoryId={inventoryId}
            showTags
            showMainSection
            fallback=""
            store={store}
            history={history}
            isInventoryApp
            shouldWrapAsPage
            BreadcrumbWrapper={
                <BreadcrumbWrapper/>
            }
            activeApp={activeApp}
            appList={appList}
            onTabSelect={onTabSelect}
        />
    );
};


```

If you want to hide the main section, just pass showMainSection as false

# Avaiable headers  

## 1. DetailHeader
You can import DetailHeader component if you have all the required data available in your application API. This component serves as a presentational component without any logic.


## 2. InventoryDetailHeader
If you do not have the data to populate the header in your application API, you can import the InventoryDetailHeader component that will request Inventory application API and populates the header with required information. 
IMPORTANT: 
1. As the data needs to be fetched on InventoryDetailHeader component, make sure to pass inventoryId to either DetailWrapper or InventoryDetailHeader itself
2. shouldApplicationDetail = true prop needs to be passed so that main section is hidden.

### Example

```JSX 
import React, { useEffect } from 'react';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { DetailHeader, DetailWrapper } from '@redhat-cloud-services/frontend-components/Inventory';


const BreadcrumbWrapper = () => (
    <Breadcrumb ouiaId="systems-list">
        <BreadcrumbItem>
            <Link to={inventory-link}>Inventory</Link>
        </BreadcrumbItem>
    </Breadcrumb>
);

const InventoryDetail = () => {
    const {  inventoryId } = useParams();
     return (
        <DetailWrapper
            // You can extend the entityDetail reducer with your own reducer
            onLoad={({ mergeWithDetail }) => {
                store.replaceReducer(combineReducers({
                    ...defaultReducers,
                    ...mergeWithDetail(SystemDetailStore)
                }));
            }}
            inventoryId={inventoryId}
        >
            <DetailHeader
                hideBack
                showTags
                inventoryId={inventoryId}
                actions={[]}
                shouldWrapAsPage
                {..apiDataAsProps}
            >
                {<YourCustomComponentsInsideHeader />}
            </DetailHeader>
            <Main>
                <YouCustomMainSection inventoryId={inventoryId}/>
            </Main>
        </DetailWrapper>);
};


```

### Wrawping with PageHeader and displaying breadcrumb
If you would like to wrap the header with PageHeader component and breadcrumb, you would need to pass shouldWrapAsPage prop together with your BreadcrumbWrapper


### Example
```JSX 
import React, { useEffect } from 'react';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { DetailHeader, DetailWrapper } from '@redhat-cloud-services/frontend-components/Inventory';


const BreadcrumbWrapper = () => (
    <Breadcrumb ouiaId="systems-list">
        <BreadcrumbItem>
            <Link to={inventory-link}>Inventory</Link>
        </BreadcrumbItem>
    </Breadcrumb>
);

const InventoryDetail = () => {
    const {  inventoryId } = useParams();
     return (
        <DetailWrapper
            // You can extend the entityDetail reducer with your own reducer
            onLoad={({ mergeWithDetail }) => {
                store.replaceReducer(combineReducers({
                    ...defaultReducers,
                    ...mergeWithDetail(SystemDetailStore)
                }));
            }}
            inventoryId={inventoryId}
        >
            <DetailHeader
                hideBack
                showTags
                inventoryId={inventoryId}
                actions={[]}
                shouldWrapAsPage
                {..apiDataAsProps}
            >
                {<YourCustomComponentsInsideHeader />}
            </DetailHeader>
            <Main>
                <SystemDetail inventoryId={inventoryId}/>
            </Main>
        </DetailWrapper>);
};


```