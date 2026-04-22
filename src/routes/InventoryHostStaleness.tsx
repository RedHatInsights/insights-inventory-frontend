import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import InventoryHostStaleness from '../components/InventoryHostStaleness';
import { useConditionalRBAC } from '../Utilities/hooks/useConditionalRBAC';
import { GENERAL_HOST_STALENESS_READ_PERMISSION } from '../components/InventoryHostStaleness/constants';
import { Bullseye, PageSection, Spinner } from '@patternfly/react-core';
import HostStalenessNoAccess from '../components/InventoryHostStaleness/HostStalenessNoAccess';
import { OutageAlert } from '../components/OutageAlert';
import { useHostStalenessKesselAccess } from '../Utilities/hooks/useHostStalenessKesselAccess';

const REQUIRED_PERMISSIONS = [GENERAL_HOST_STALENESS_READ_PERMISSION];

const HostStaleness = () => {
  const chrome = useChrome();
  const { hasAccess: canReadHostStalenessRbac } = useConditionalRBAC(
    REQUIRED_PERMISSIONS,
    true,
  );
  const kesselAccess = useHostStalenessKesselAccess();

  useEffect(() => {
    chrome?.updateDocumentTitle?.(
      'Staleness and Deletion - System Configuration',
    );
    chrome.hideGlobalFilter(true);
  }, [chrome]);

  const canReadHostStaleness =
    kesselAccess.mode === 'kessel'
      ? kesselAccess.canViewPage
      : canReadHostStalenessRbac;

  const kesselEditOverride =
    kesselAccess.mode === 'kessel' ? kesselAccess.canEditStaleness : undefined;

  const editDisabledTooltip =
    kesselAccess.mode === 'kessel'
      ? kesselAccess.editDisabledTooltip
      : undefined;

  return (
    <PageSection>
      <PageHeader>
        <PageHeaderTitle title={'Staleness and Deletion'} />
        <OutageAlert />
      </PageHeader>
      <PageSection hasBodyWrapper={false} variant="default">
        {kesselAccess.mode === 'kessel' && kesselAccess.isLoading ? (
          <Bullseye>
            <Spinner aria-label="Loading permissions" />
          </Bullseye>
        ) : canReadHostStaleness ? (
          <InventoryHostStaleness
            kesselCanModifyHostStaleness={kesselEditOverride}
            editDisabledTooltip={editDisabledTooltip}
          />
        ) : (
          <HostStalenessNoAccess />
        )}
      </PageSection>
    </PageSection>
  );
};

export default HostStaleness;
