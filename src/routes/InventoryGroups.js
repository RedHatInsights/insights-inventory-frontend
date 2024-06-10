import React, { useEffect } from 'react';
import InventoryGroups from '../components/InventoryGroups';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Flex } from '@patternfly/react-core';
import InventoryGroupsPopover from '../components/InventoryGroups/SmallComponents/Popover';
import useWorkspaceFeatureFlag from '../Utilities/hooks/useWorkspaceFeatureFlag';

const Groups = () => {
  const chrome = useChrome();
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  useEffect(() => {
    chrome?.hideGlobalFilter?.();
    chrome?.updateDocumentTitle?.(
      `${isWorkspaceEnabled ? 'Workspaces' : 'Groups'} - Inventory`
    );
  }, []);

  return (
    <React.Fragment>
      <PageHeader>
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <PageHeaderTitle
            title={isWorkspaceEnabled ? 'Workspaces' : 'Groups'}
          />
          <InventoryGroupsPopover />
        </Flex>
      </PageHeader>
      <InventoryGroups />
    </React.Fragment>
  );
};

export default Groups;
