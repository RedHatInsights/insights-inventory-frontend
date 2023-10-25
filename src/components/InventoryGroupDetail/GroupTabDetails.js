import { useLocation, useNavigate } from 'react-router-dom';
import { resolveRelPath } from '../../Utilities/path';
import {
  getNotificationProp,
  manageEdgeInventoryUrlName,
} from '../../Utilities/edge';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import {
  Bullseye,
  PageSection,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import React, { Suspense, lazy, useState } from 'react';
import { hybridInventoryTabKeys } from '../../Utilities/constants';
import GroupSystems from '../GroupSystems';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS } from '../../constants';

import { EmptyStateNoAccessToSystems } from './EmptyStateNoAccess';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const GroupTabDetailsWrapper = ({ groupId, groupName, activeTab }) => {
  const dispatch = useDispatch();

  const [tab, setTab] = useState(0);
  const { hasAccess: canViewHosts } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(groupId)
  );

  const handleTabClick = (_event, tabIndex) => {
    setTab(tabIndex);
  };
  const notificationProp = getNotificationProp(dispatch);

  const [activeTabKey, setActiveTabKey] = useState(0);

  return (
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
              activeKey={activeTab && tab == 0 ? activeTab : tab}
              onSelect={handleTabClick}
              aria-label="Hybrid inventory tabs"
            >
              <Tab
                eventKey={hybridInventoryTabKeys.conventional.key}
                title={<TabTitleText>Conventional (RPM-DNF)</TabTitleText>}
              >
                <GroupSystems groupName={groupName} groupId={groupId} />
              </Tab>
              <Tab
                eventKey={hybridInventoryTabKeys.immutable.key}
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
  );
};

GroupTabDetailsWrapper.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  activeTab: PropTypes.string,
};
export default GroupTabDetailsWrapper;
