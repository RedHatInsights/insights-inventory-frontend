import {
  Bullseye,
  PageSection,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../store/inventory-actions';
import GroupSystems from '../GroupSystems';
import GroupDetailHeader from './GroupDetailHeader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  REQUIRED_PERMISSIONS_TO_READ_GROUP,
  REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS,
} from '../../constants';
import {
  EmptyStateNoAccessToGroup,
  EmptyStateNoAccessToSystems,
} from './EmptyStateNoAccess';

import { useLocation, useNavigate } from 'react-router-dom';
import { resolveRelPath } from '../../Utilities/path';
import {
  getNotificationProp,
  manageEdgeInventoryUrlName,
} from '../../Utilities/edge';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

import useFeatureFlag from '../../Utilities/useFeatureFlag';
import axios from 'axios';
import {
  INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS,
  INVENTORY_TOTAL_FETCH_EDGE_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  hybridInventoryTabKeys,
} from '../../Utilities/constants';

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    }
  >
    {children}
  </Suspense>
);
const InventoryGroupDetail = ({ groupId }) => {
  const [activeTab, setActiveTab] = useState(
    hybridInventoryTabKeys.conventional.key
  );

  const handleTabClick = (_event, tabIndex) => {
    setActiveTab(tabIndex);
  };

  const dispatch = useDispatch();
  const notificationProp = getNotificationProp(dispatch);
  const { data } = useSelector((state) => state.groupDetail);
  const chrome = useChrome();
  const groupName = data?.results?.[0]?.name;

  const { hasAccess: canViewGroup } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP(groupId)
  );

  const { hasAccess: canViewHosts } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(groupId)
  );

  useEffect(() => {
    if (canViewGroup === true) {
      dispatch(fetchGroupDetail(groupId));
    }
  }, [canViewGroup]);

  useEffect(() => {
    // if available, change ID to the group's name in the window title
    chrome?.updateDocumentTitle?.(
      `${groupName || groupId} - Inventory Groups | Red Hat Insights`
    );
  }, [data]);

  const [activeTabKey, setActiveTabKey] = useState(0);

  // TODO: append search parameter to identify the active tab

  const [hasEdgeImages, setHasEdgeImages] = useState(false);
  const EdgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');
  useEffect(() => {
    if (EdgeParityEnabled) {
      try {
        axios
          .get(
            `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_EDGE_PARAMS}&group_name=${groupName}`
          )
          .then((result) => {
            const accountHasEdgeImages = result?.data?.total > 0;
            setHasEdgeImages(accountHasEdgeImages);
            axios
              .get(
                `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS}&group_name=${groupName}`
              )
              .then((conventionalImages) => {
                const accountHasConventionalImages =
                  conventionalImages?.data?.total > 0;
                if (accountHasEdgeImages && !accountHasConventionalImages) {
                  setActiveTab(hybridInventoryTabKeys.immutable.key);
                } else {
                  setActiveTab(hybridInventoryTabKeys.conventional.key);
                }
              });
          });
      } catch (e) {
        console.log('>>>> ' + e);
      }
    }
  }, []);

  return hasEdgeImages && canViewGroup ? (
    <React.Fragment>
      <GroupDetailHeader groupId={groupId} />
      {canViewGroup ? (
        <PageSection variant="light" type="tabs">
          <Tabs
            activeKey={activeTabKey}
            onSelect={(event, value) => setActiveTabKey(value)}
            aria-label="Group tabs"
            role="region"
            inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
          >
            <Tab eventKey={0} title="Systems" aria-label="Group systems tab">
              <PageSection>
                {canViewHosts ? (
                  <Tabs
                    className="pf-m-light pf-c-table"
                    activeKey={activeTab}
                    onSelect={handleTabClick}
                    aria-label="Hybrid inventory tabs"
                  >
                    <Tab
                      eventKey={hybridInventoryTabKeys.conventional.key}
                      // eventKey={2}
                      title={
                        <TabTitleText>Conventional (RPM-DNF)</TabTitleText>
                      }
                    >
                      <GroupSystems groupName={groupName} groupId={groupId} />
                    </Tab>
                    <Tab
                      eventKey={hybridInventoryTabKeys.immutable.key}
                      // eventKey={3}
                      title={<TabTitleText>Immutable (OSTree)</TabTitleText>}
                    >
                      <AsyncComponent
                        appName="edge"
                        module="./DevicesView"
                        ErrorComponent={<ErrorState />}
                        navigateProp={useNavigate}
                        locationProp={useLocation}
                        notificationProp={notificationProp}
                        pathPrefix={resolveRelPath('')}
                        urlName={manageEdgeInventoryUrlName}
                        groupUUID={groupId}
                        {...groupId}
                      />
                    </Tab>
                  </Tabs>
                ) : (
                  <EmptyStateNoAccessToSystems />
                )}
              </PageSection>
            </Tab>
            <Tab eventKey={1} title="Group info" aria-label="Group info tab">
              {activeTabKey === 1 && ( // helps to lazy load the component
                <PageSection>
                  <Suspense
                    fallback={
                      <Bullseye>
                        <Spinner />
                      </Bullseye>
                    }
                  >
                    <GroupDetailInfo />
                  </Suspense>
                </PageSection>
              )}
            </Tab>
          </Tabs>
        </PageSection>
      ) : (
        <PageSection>
          <EmptyStateNoAccessToGroup />
        </PageSection>
      )}
    </React.Fragment>
  ) : (
    <GroupSystems groupName={groupName} groupId={groupId} />
  );
};

InventoryGroupDetail.propTypes = {
  groupId: PropTypes.string.isRequired,
};

SuspenseWrapper.propTypes = {
  children: PropTypes.element,
};
export default InventoryGroupDetail;
