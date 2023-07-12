import React, { useEffect } from 'react';
import InventoryGroups from '../components/InventoryGroups';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { GENERAL_GROUPS_READ_PERMISSION } from '../constants';
import { EmptyStateNoAccessToGroups } from '../components/InventoryGroupDetail/EmptyStateNoAccess';

const REQUIRED_PERMISSIONS = [GENERAL_GROUPS_READ_PERMISSION];

const Groups = () => {
  const chrome = useChrome();
  const { hasAccess } = usePermissionsWithContext(REQUIRED_PERMISSIONS);

  useEffect(() => {
    chrome?.updateDocumentTitle?.('Inventory Groups | Red Hat Insights');
  }, [chrome]);

  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title="Groups" />
      </PageHeader>
      {hasAccess ? <InventoryGroups /> : <EmptyStateNoAccessToGroups />}
    </React.Fragment>
  );
};

export default Groups;
