import {
  Bullseye,
  EmptyStateVariant,
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
import AccessDenied from '../../Utilities/AccessDenied';
import { REQUIRED_PERMISSIONS_TO_READ_GROUP } from '../../constants';

const GroupDetailInfo = lazy(() => import('./GroupDetailInfo'));

const InventoryGroupDetail = ({ groupId }) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.groupDetail);
  const chrome = useChrome();
  const groupName = data?.results?.[0]?.name;

  const { hasAccess: canView } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP(groupId)
  );

  const EmptyStateNoAccess = () => (
    <AccessDenied
      title="Access needed for systems in this group"
      showReturnButton={false}
      description={
        <div>
          You do not have the necessary inventory host permissions to see the
          systems in this group. Contact your organization administrator for
          access.
        </div>
      }
      variant={EmptyStateVariant.large} // overrides the default "full" value
    />
  );

  useEffect(() => {
    if (canView === true) {
      dispatch(fetchGroupDetail(groupId));
    }
  }, [canView]);

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
              {canView ? (
                <GroupSystems groupName={groupName} groupId={groupId} />
              ) : (
                <EmptyStateNoAccess />
              )}
            </PageSection>
          </Tab>
          <Tab eventKey={1} title="Group info" aria-label="Group info tab">
            {activeTabKey === 1 && ( // helps to lazy load the component
              <PageSection>
                {canView ? (
                  <Suspense
                    fallback={
                      <Bullseye>
                        <Spinner />
                      </Bullseye>
                    }
                  >
                    <GroupDetailInfo />
                  </Suspense>
                ) : (
                  <EmptyStateNoAccess />
                )}
              </PageSection>
            )}
          </Tab>
        </Tabs>
      </PageSection>
    </React.Fragment>
  );
};

InventoryGroupDetail.propTypes = {
  groupId: PropTypes.string.isRequired,
};

export default InventoryGroupDetail;
