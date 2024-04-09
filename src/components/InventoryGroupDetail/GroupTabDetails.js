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
import GroupSystems from '../GroupSystems/GroupSystems';
import GroupImmutableSystems from '../GroupSystems/GroupImmutableSystems';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS } from '../../constants';
import { EmptyStateNoAccessToSystems } from './EmptyStateNoAccess';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const GroupTabDetailsWrapper = ({
  groupId,
  groupName,
  activeTab,
  hasEdgeImages,
}) => {
  const [tab, setTab] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState(0);

  const { hasAccess: canViewHosts } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(groupId)
  );

  return (
    <Tabs
      activeKey={activeTabKey}
      onSelect={(event, value) => setActiveTabKey(value)}
      aria-label="Group tabs"
      role="region"
      inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
      mountOnEnter
      unmountOnExit
    >
      <Tab eventKey={0} title="Systems" aria-label="Group systems tab">
        <PageSection>
          {canViewHosts && hasEdgeImages ? (
            <Tabs
              className="pf-m-light pf-v5-c-table"
              activeKey={activeTab && tab == 0 ? activeTab : tab}
              onSelect={(_event, tabIndex) => {
                setTab(tabIndex);
              }}
              aria-label="Hybrid inventory tabs"
            >
              <Tab
                eventKey={hybridInventoryTabKeys.conventional.key}
                title={<TabTitleText>Conventional (RPM-DNF)</TabTitleText>}
              >
                <GroupSystems
                  groupName={groupName}
                  groupId={groupId}
                  hostType={hybridInventoryTabKeys.conventional.key}
                />
              </Tab>
              <Tab
                eventKey={hybridInventoryTabKeys.immutable.key}
                title={<TabTitleText>Immutable (OSTree)</TabTitleText>}
              >
                <GroupImmutableSystems
                  groupId={groupId}
                  groupName={groupName}
                  hostType={hybridInventoryTabKeys.immutable.key}
                />
              </Tab>
            </Tabs>
          ) : canViewHosts ? (
            <GroupSystems groupName={groupName} groupId={groupId} />
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
  hasEdgeImages: PropTypes.bool,
};
export default GroupTabDetailsWrapper;
