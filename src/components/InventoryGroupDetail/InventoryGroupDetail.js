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
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  REQUIRED_PERMISSIONS_TO_READ_GROUP,
  REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS,
} from '../../constants';
import {
  EmptyStateNoAccessToGroup,
  EmptyStateNoAccessToSystems,
} from './EmptyStateNoAccess';
import HybridInventoryTabs from '../../components/InventoryTabs/HybridInventoryTabs';
import ImmutableDevicesView from '../InventoryTabs/ImmutableDevices/EdgeDevicesView';
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
const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const InventoryGroupDetail = ({ groupId }) => {
  const dispatch = useDispatch();
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

  return (
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
                  <HybridInventoryTabs
                    ConventionalSystemsTab={
                      <SuspenseWrapper>
                        <GroupSystems groupName={groupName} groupId={groupId} />
                      </SuspenseWrapper>
                    }
                    ImmutableDevicesTab={
                      <SuspenseWrapper>
                        <ImmutableDevicesView groupUUID={groupId} />
                      </SuspenseWrapper>
                    }
                    groupName={groupName}
                    groupId={groupId}
                    isImmutableTabOpen={false}
                    isEdgeParityEnabled={true}
                    tabPathname={'groups'}
                  />
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
  );
};

InventoryGroupDetail.propTypes = {
  groupId: PropTypes.string.isRequired,
};
SuspenseWrapper.propTypes = {
  children: PropTypes.element,
};
export default InventoryGroupDetail;
