import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import InventoryHostStaleness from '../components/InventoryHostStaleness';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_HOST_STALENESS_WRITE_PERMISSION } from '../components/InventoryHostStaleness/constants';
import HostStalenessEmptyState from '../components/InventoryHostStaleness/HostStalenessEmptyState';
import { Page, PageSection } from '@patternfly/react-core';

const REQUIRED_PERMISSIONS = [GENERAL_HOST_STALENESS_WRITE_PERMISSION];

const HostStaleness = () => {
  const chrome = useChrome();
  const { hasAccess: canModifyHostStaleness } =
    usePermissionsWithContext(REQUIRED_PERMISSIONS);

  useEffect(() => {
    chrome?.updateDocumentTitle?.(
      'Staleness and Culling - System Configuration - Inventory | Red Hat Insights'
    );
  }, [chrome]);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title={'Staleness and Culling'} />
      </PageHeader>
      {canModifyHostStaleness ? (
        <InventoryHostStaleness />
      ) : (
        <Page>
          <PageSection variant="default">
            <HostStalenessEmptyState />
          </PageSection>
        </Page>
      )}
    </React.Fragment>
  );
};

export default HostStaleness;
