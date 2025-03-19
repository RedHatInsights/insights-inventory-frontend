import {
  Bullseye,
  PageSection,
  Spinner,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import React, { Suspense, lazy, useMemo, useState } from 'react';
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
  activeTab: activeSystemsTab,
  setActiveTab: setActiveSystemsTab,
  hasEdgeImages,
}) => {
  const [activeTab, setActiveTab] = useState('systems');

  const { hasAccess: canViewHosts } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(groupId)
  );
  const conventionalSystemsContent = useMemo(
    () => (
      <GroupSystems
        groupName={groupName}
        groupId={groupId}
        hostType={hybridInventoryTabKeys.conventional.key}
      />
    ),
    [groupId, groupName]
  );

  const immutableSystemsContent = useMemo(
    () => (
      <GroupImmutableSystems
        groupId={groupId}
        groupName={groupName}
        hostType={hybridInventoryTabKeys.immutable.key}
      />
    ),
    [groupId, groupName]
  );

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(_event, value) => setActiveTab(value)}
      aria-label="Group tabs"
      role="region"
      inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
      mountOnEnter
      unmountOnExit
    >
      <Tab eventKey="systems" title="Systems" aria-label="Group systems tab">
        <PageSection>
          {canViewHosts && hasEdgeImages ? (
            <Tabs
              className="pf-m-light pf-v5-c-table"
              activeKey={activeSystemsTab}
              onSelect={(_event, tabIndex) => setActiveSystemsTab(tabIndex)}
              aria-label="Hybrid inventory tabs"
              unmountOnExit
            >
              <Tab
                eventKey={hybridInventoryTabKeys.conventional.key}
                title={<TabTitleText>Conventional (RPM-DNF)</TabTitleText>}
              >
                {conventionalSystemsContent}
              </Tab>
              <Tab
                eventKey={hybridInventoryTabKeys.immutable.key}
                title={<TabTitleText>Immutable (OSTree)</TabTitleText>}
              >
                {immutableSystemsContent}
              </Tab>
            </Tabs>
          ) : canViewHosts ? (
            <GroupSystems groupName={groupName} groupId={groupId} />
          ) : (
            <EmptyStateNoAccessToSystems />
          )}
        </PageSection>
      </Tab>
      <Tab eventKey="info" title="Workspace info" aria-label="Group info tab">
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
      </Tab>
    </Tabs>
  );
};

GroupTabDetailsWrapper.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  hasEdgeImages: PropTypes.bool,
};
export default GroupTabDetailsWrapper;
