import React, { useEffect } from 'react';
import InventoryGroups from '../components/InventoryGroups';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import AccessDenied from '../Utilities/AccessDenied';
import { EmptyStateVariant } from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { GENERAL_GROUPS_READ_PERMISSION } from '../constants';

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
      {hasAccess ? (
        <InventoryGroups />
      ) : (
        <AccessDenied
          title="Inventory group access permissions needed"
          showReturnButton={false}
          description={
            <div>
              You do not have the necessary inventory group permissions to see
              inventory groups. Contact your organization administrator for
              access.
            </div>
          }
          variant={EmptyStateVariant.large} // overrides the default "full" value
        />
      )}
    </React.Fragment>
  );
};

export default Groups;
