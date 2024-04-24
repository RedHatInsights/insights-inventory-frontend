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
  EmptyStateNoAccessToGroup,
  EmptyStateNoAccessToSystems,
} from './EmptyStateNoAccess';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import axios from 'axios';
import {
  INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS,
  INVENTORY_TOTAL_FETCH_EDGE_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  hybridInventoryTabKeys,
} from '../../Utilities/constants';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

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
  }, [canViewGroup]);

  useEffect(() => {
    // if available, change ID to the group's name in the window title
    chrome?.updateDocumentTitle?.(
      `${groupName || groupId} - Inventory Groups | RHEL`
    );
  }, [data]);

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
                `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS}&group_name=${groupName}&filter[system_profile][host_type]=nil`
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
        setHasEdgeImages(false);
        setActiveTab(hybridInventoryTabKeys.conventional.key);
      }
    }
  }, [data]);

  if (
    (fulfilled && data.total === 0) || // group does not exist
    (rejected && error.status === 400) // group name not correct
  ) {
    navigate('/groups');
  }

  return hasEdgeImages && canViewGroup && EdgeParityEnabled ? (
    <React.Fragment>
      <GroupDetailHeader groupId={groupId} />
      {canViewGroup ? (
        <PageSection variant="light" type="tabs">
          <GroupTabDetails
            groupId={groupId}
            groupName={groupName}
            activeTab={activeTab}
            hasEdgeImages={hasEdgeImages}
          />
        </PageSection>
      ) : (
        <PageSection>
          <EmptyStateNoAccessToGroup />
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
            onSelect={(event, value) => setActiveTabKey(value)}
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
  groupName: PropTypes.string,
};

export default InventoryGroupDetail;
