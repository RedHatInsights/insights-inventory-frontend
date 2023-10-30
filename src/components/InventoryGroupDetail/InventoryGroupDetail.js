import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import PropTypes from 'prop-types';
import React, { Suspense, lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../store/inventory-actions';
import GroupDetailHeader from './GroupDetailHeader';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { REQUIRED_PERMISSIONS_TO_READ_GROUP } from '../../constants';
import { EmptyStateNoAccessToGroup } from './EmptyStateNoAccess';
import HybridInventoryTabs from '../../components/InventoryTabs/HybridInventoryTabs';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
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
const GroupTabDetails = lazy(() => import('./GroupTabDetails'));
const InventoryGroupDetail = ({ groupId }) => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.groupDetail);
  const chrome = useChrome();
  const groupName = data?.results?.[0]?.name;

  const { hasAccess: canViewGroup } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP(groupId)
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

  // TODO: append search parameter to identify the active tab
  return (
    <React.Fragment>
      <PageHeader className="pf-m-light">
        <PageHeaderTitle title="Systems" />
        <GroupDetailHeader groupId={groupId} />
      </PageHeader>

      <Main>
        {canViewGroup ? (
          <HybridInventoryTabs
            ConventionalSystemsTab={
              <SuspenseWrapper>
                <GroupTabDetails {...groupId} />
              </SuspenseWrapper>
            }
            ImmutableDevicesTab={
              <SuspenseWrapper>
                <GroupTabDetails {...groupId} />
              </SuspenseWrapper>
            }
            groupName={groupName}
            groupId={groupId}
            isImmutableTabOpen={false}
            isEdgeParityEnabled={true}
            tabPathname={InventoryGroupDetail.groupTabPathName}
          />
        ) : (
          <PageSection>
            <EmptyStateNoAccessToGroup />
          </PageSection>
        )}
      </Main>
    </React.Fragment>
  );
};

InventoryGroupDetail.propTypes = {
  groupId: PropTypes.string.isRequired,
  groupName: PropTypes.string,
};
InventoryGroupDetail.defaultProps = {
  groupTabPathName: 'insights/inventory/groups',
};
SuspenseWrapper.propTypes = {
  children: PropTypes.element,
};

export default InventoryGroupDetail;
