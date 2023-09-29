import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import InventoryHostStaleness from '../components/InventoryHostStaleness';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_HOST_STALENESS_READ_PERMISSION } from '../components/InventoryHostStaleness/constants';
import { Page, PageSection } from '@patternfly/react-core';
import HostStalenessNoAccess from '../components/InventoryHostStaleness/HostStalenessNoAccess';
import { GENERAL_GROUPS_READ_PERMISSION } from '../constants';

const REQUIRED_PERMISSIONS = [
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_GROUPS_READ_PERMISSION,
];

const HostStaleness = () => {
  const chrome = useChrome();
  const { hasAccess: canReadHostStaleness } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS,
    null,
    false
  );

  useEffect(() => {
    chrome?.updateDocumentTitle?.(
      'Staleness and Culling - System Configuration - Inventory | Red Hat Insights'
    );
    chrome.hideGlobalFilter(true);
  }, []);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title={'Staleness and Culling'} />
      </PageHeader>
      {canReadHostStaleness ? (
        <Page>
          <PageSection variant="default">
            <InventoryHostStaleness />
          </PageSection>
        </Page>
      ) : (
        <Page>
          <PageSection variant="default">
            <HostStalenessNoAccess />
          </PageSection>
        </Page>
      )}
    </React.Fragment>
  );
};

export default HostStaleness;
