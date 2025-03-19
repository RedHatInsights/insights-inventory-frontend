import {
  Bullseye,
  PageSection,
  Spinner,
  Tab,
  Tabs,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../store/inventory-actions';
import GroupSystems from '../GroupSystems';
import GroupTabDetails from './GroupTabDetails';
import GroupDetailHeader from './GroupDetailHeader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  REQUIRED_PERMISSIONS_TO_READ_GROUP,
  REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS,
} from '../../constants';
import {
  EmptyStateNoAccessToGroups,
  EmptyStateNoAccessToSystems,
} from './EmptyStateNoAccess';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { hybridInventoryTabKeys } from '../../Utilities/constants';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';
import { getHostList } from '../../api/hostInventoryApi';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const InventoryGroupDetail = ({ groupId }) => {
  const [activeTabKey, setActiveTabKey] = useState(0);

  const [activeTab, setActiveTab] = useState(
    hybridInventoryTabKeys.conventional.key
  );

  const dispatch = useDispatch();
  const { data, fulfilled, rejected, error } = useSelector(
    (state) => state.groupDetail
  );
  const navigate = useInsightsNavigate();

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

    return () => {
      dispatch({ type: 'GROUP_DETAIL_RESET' });
    };
  }, [canViewGroup, groupId, dispatch]);

  useEffect(() => {
    // if available, change ID to the group's name in the window title
    chrome?.updateDocumentTitle?.(`${groupName || groupId} - Workspaces`);
  }, [groupName, groupId, chrome]);

  // TODO: append search parameter to identify the active tab

  const [hasEdgeImages, setHasEdgeImages] = useState(false);
  const edgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');

  useEffect(() => {
    // determines the active tab opened by default
    const lookUpAvailableSystems = async () => {
      const conventionalSystems = await getHostList({
        groupName,
        perPage: 1,
        page: 1,
        filter: { system_profile: { host_type: 'edge' } },
      });

      const immutableSystems = await getHostList({
        groupName,
        perPage: 1,
        page: 1,
        filter: { system_profile: { host_type: 'nil' } },
      });

      if (immutableSystems.data.total > 0) {
        setHasEdgeImages(true);

        if (conventionalSystems.data.total === 0) {
          setActiveTab(hybridInventoryTabKeys.immutable.key);
        }
      }
    };

    if (edgeParityEnabled) {
      try {
        lookUpAvailableSystems();
      } catch (error) {
        console.error(error);
      }
    }
  }, [edgeParityEnabled, groupName]);

  if (
    (fulfilled && data.total === 0) || // group does not exist
    (rejected && error.status === 400) // group name not correct
  ) {
    navigate('/groups');
  }

  return hasEdgeImages && canViewGroup && edgeParityEnabled ? (
    <React.Fragment>
      <GroupDetailHeader groupId={groupId} />
      {canViewGroup ? (
        <PageSection variant="light" type="tabs">
          <GroupTabDetails
            groupId={groupId}
            groupName={groupName}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasEdgeImages={hasEdgeImages}
          />
        </PageSection>
      ) : (
        <PageSection>
          <EmptyStateNoAccessToGroups isSingle />
        </PageSection>
      )}
    </React.Fragment>
  ) : (
    <React.Fragment>
      <GroupDetailHeader groupId={groupId} />
      {canViewGroup ? (
        <PageSection variant="light" type="tabs">
          <Tabs
            activeKey={activeTabKey}
            onSelect={(_event, value) => setActiveTabKey(value)}
            aria-label="Group tabs"
            role="region"
            inset={{ default: 'insetMd' }} // add extra space before the first tab (according to mocks)
          >
            <Tab eventKey={0} title="Systems" aria-label="Group systems tab">
              <PageSection>
                {canViewHosts ? (
                  <GroupSystems groupName={groupName} groupId={groupId} />
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
