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
import GroupDetailHeader from './GroupDetailHeader';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
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

  return (
    <React.Fragment>
      <GroupDetailHeader groupId={groupId} />
      {canViewGroup ? (
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
