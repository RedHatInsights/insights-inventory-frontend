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
import useWorkspaceFeatureFlag from '../../Utilities/hooks/useWorkspaceFeatureFlag';
import { groupTabKeys } from './constants';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const GroupTabDetailsWrapper = ({
  groupId,
  groupName,
  activeTab,
  hasEdgeImages,
}) => {
  const [groupTabKey, setGroupTabKey] = useState(groupTabKeys.systems);
  const [hybridInventoryTabKey, setHybridInventoryTabKey] = useState(
    hybridInventoryTabKeys.conventional.key
  );

  const { hasAccess: canViewHosts } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(groupId)
  );
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  return (
    <Tabs
      activeKey={groupTabKey}
      onSelect={(event, value) => setGroupTabKey(value)}
      aria-label="Group tabs"
      role="region"
      inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
      mountOnEnter
      unmountOnExit
    >
      <Tab
        eventKey={groupTabKeys.systems}
        title="Systems"
        aria-label="Group systems tab"
      >
        <PageSection>
          {canViewHosts && hasEdgeImages ? (
            <Tabs
              className="pf-m-light pf-v5-c-table"
              activeKey={
                activeTab &&
                hybridInventoryTabKey == hybridInventoryTabKeys.conventional.key
                  ? activeTab
                  : hybridInventoryTabKey
              }
              onSelect={(_event, tabIndex) => {
                setHybridInventoryTabKey(tabIndex);
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
      <Tab
        eventKey={groupTabKeys.groupInfo}
        title={isWorkspaceEnabled ? 'Workspace info' : 'Group info'}
        aria-label="Group info tab"
      >
        {groupTabKey === groupTabKeys.groupInfo && ( // helps to lazy load the component
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
