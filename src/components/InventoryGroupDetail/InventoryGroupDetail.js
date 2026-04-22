import {
  Bullseye,
  PageSection,
  Spinner,
  Tab,
  Tabs,
} from '@patternfly/react-core';
import AccessDenied from '../../Utilities/AccessDenied';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../store/inventory-actions';
import GroupSystems from '../GroupSystems';
import GroupDetailHeader from './GroupDetailHeader';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';
import { useWorkspaceDetailKesselPermissions } from '../../Utilities/hooks/useWorkspaceDetailKesselPermissions';
import {
  REQUIRED_PERMISSIONS_TO_READ_GROUP,
  REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS,
} from '../../constants';
import {
  EmptyStateNoAccessToGroups,
  EmptyStateNoAccessToSystems,
} from './EmptyStateNoAccess';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const InventoryGroupDetail = ({ groupId }) => {
  const [activeTabKey, setActiveTabKey] = useState(0);

  const dispatch = useDispatch();
  const { data, fulfilled, rejected, error } = useSelector(
    (state) => state.groupDetail,
  );
  const navigate = useInsightsNavigate();

  const chrome = useChrome();
  const groupName = data?.results?.[0]?.name;
  const ungrouped = data?.results?.[0]?.ungrouped;
  const isUngroupedHostsWorkspace =
    fulfilled && Boolean(data?.results?.[0]?.ungrouped);

  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const workspaceKessel = useWorkspaceDetailKesselPermissions(groupId, {
    skipKessel: isUngroupedHostsWorkspace,
  });

  const workspaceAccess = useMemo(
    () => ({
      canEdit: workspaceKessel.canEdit,
      isLoading: workspaceKessel.isLoading,
      gateActive: workspaceKessel.appliesKesselWorkspaceChecks,
    }),
    [
      workspaceKessel.canEdit,
      workspaceKessel.isLoading,
      workspaceKessel.appliesKesselWorkspaceChecks,
    ],
  );

  const kesselWorkspaceChecksActive =
    isKesselEnabled &&
    fulfilled &&
    !isUngroupedHostsWorkspace &&
    workspaceKessel.appliesKesselWorkspaceChecks;

  const kesselWorkspaceAccessDenied =
    kesselWorkspaceChecksActive &&
    !workspaceKessel.isLoading &&
    workspaceKessel.canView === false;

  const kesselWorkspacePermissionsLoading =
    kesselWorkspaceChecksActive && workspaceKessel.isLoading;

  const { hasAccess: canViewGroup } = useConditionalRBAC(
    REQUIRED_PERMISSIONS_TO_READ_GROUP(groupId),
  );
  const { hasAccess: canViewHosts } = useConditionalRBAC(
    REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS(groupId),
  );

  useEffect(() => {
    if (canViewGroup === true) {
      dispatch(fetchGroupDetail(groupId));
    }

    return () => {
      dispatch({ type: 'GROUP_DETAIL_RESET' });
    };
  }, [canViewGroup, groupId, dispatch]);

  useEffect(() => {
    // if available, change ID to the group's name in the window title
    chrome?.updateDocumentTitle?.(`${groupName || groupId} - Workspaces`);
  }, [groupName, groupId, chrome]);

  if (
    (fulfilled && data.total === 0) || // group does not exist
    (rejected && error.status === 400) // group name not correct
  ) {
    navigate('/groups');
  }

  const renderWorkspaceContent = () => {
    if (kesselWorkspaceAccessDenied) {
      return (
        <PageSection hasBodyWrapper={false}>
          <AccessDenied
            title="You do not have access to this workspace"
            description={
              <div>
                You do not have permission to view this workspace in inventory.
              </div>
            }
          />
        </PageSection>
      );
    }

    if (kesselWorkspacePermissionsLoading) {
      return (
        <PageSection hasBodyWrapper={false}>
          <Bullseye className="pf-v6-u-p-xl">
            <Spinner aria-label="Loading workspace permissions" />
          </Bullseye>
        </PageSection>
      );
    }

    return (
      <PageSection hasBodyWrapper={false} type="tabs">
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event, value) => setActiveTabKey(value)}
          aria-label="Group tabs"
          role="region"
          inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
        >
          <Tab eventKey={0} title="Systems" aria-label="Group systems tab">
            <PageSection hasBodyWrapper={false}>
              {canViewHosts ? (
                <GroupSystems
                  groupName={groupName}
                  groupId={groupId}
                  ungrouped={ungrouped}
                  workspaceAccess={workspaceAccess}
                />
              ) : (
                <EmptyStateNoAccessToSystems />
              )}
            </PageSection>
          </Tab>
          <Tab
            eventKey={1}
            title="Workspace info"
            aria-label="Workspace info tab"
          >
            {activeTabKey === 1 && ( // helps to lazy load the component
              <PageSection hasBodyWrapper={false}>
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
    );
  };

  return (
    <React.Fragment>
      <GroupDetailHeader groupId={groupId} workspaceAccess={workspaceAccess} />
      {canViewGroup ? (
        renderWorkspaceContent()
      ) : (
        <PageSection hasBodyWrapper={false}>
          <EmptyStateNoAccessToGroups isSingle />
        </PageSection>
      )}
    </React.Fragment>
  );
};

InventoryGroupDetail.propTypes = {
  groupId: PropTypes.string.isRequired,
};

export default InventoryGroupDetail;
