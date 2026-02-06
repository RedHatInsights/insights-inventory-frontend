import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import InventoryHostStaleness from '../components/InventoryHostStaleness';
import { useConditionalRBAC } from '../Utilities/hooks/useConditionalRBAC';
import { GENERAL_HOST_STALENESS_READ_PERMISSION } from '../components/InventoryHostStaleness/constants';
import { PageSection } from '@patternfly/react-core';
import HostStalenessNoAccess from '../components/InventoryHostStaleness/HostStalenessNoAccess';
import { OutageAlert } from '../components/OutageAlert';

const REQUIRED_PERMISSIONS = [GENERAL_HOST_STALENESS_READ_PERMISSION];

const HostStaleness = () => {
  const chrome = useChrome();
  const { hasAccess: canReadHostStaleness } = useConditionalRBAC(
    REQUIRED_PERMISSIONS,
    true,
  );

  useEffect(() => {
    chrome?.updateDocumentTitle?.(
      'Staleness and Deletion - System Configuration',
    );
    chrome.hideGlobalFilter(true);
  }, [chrome]);

  return (
    <PageSection>
      <PageHeader>
        <PageHeaderTitle title={'Staleness and Deletion'} />
        <OutageAlert />
      </PageHeader>
      <PageSection hasBodyWrapper={false} variant="default">
        {canReadHostStaleness ? (
          <InventoryHostStaleness />
        ) : (
          <HostStalenessNoAccess />
        )}
      </PageSection>
    </PageSection>
  );
};

export default HostStaleness;
