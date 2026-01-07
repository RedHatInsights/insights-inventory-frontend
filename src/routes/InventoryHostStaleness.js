import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import InventoryHostStaleness from '../components/InventoryHostStaleness';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_HOST_STALENESS_READ_PERMISSION } from '../components/InventoryHostStaleness/constants';
import { PageSection } from '@patternfly/react-core';
import HostStalenessNoAccess from '../components/InventoryHostStaleness/HostStalenessNoAccess';
import { OutageAlert } from '../components/OutageAlert';

const REQUIRED_PERMISSIONS = [GENERAL_HOST_STALENESS_READ_PERMISSION];

const HostStaleness = () => {
  const chrome = useChrome();
  const { hasAccess: canReadHostStaleness } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS,
    true,
  );

  useEffect(() => {
    chrome?.updateDocumentTitle?.(
      'Staleness and Deletion - System Configuration',
    );
    chrome.hideGlobalFilter(true);
  }, []);

  return (
    <PageSection>
      <PageHeader>
        <PageHeaderTitle title={'Staleness and Deletion'} />
        <OutageAlert />
      </PageHeader>
      {canReadHostStaleness ? (
        <PageSection hasBodyWrapper={false} variant="default">
          <InventoryHostStaleness />
        </PageSection>
      ) : (
        <PageSection hasBodyWrapper={false} variant="default">
          <HostStalenessNoAccess />
        </PageSection>
      )}
    </PageSection>
  );
};

export default HostStaleness;
