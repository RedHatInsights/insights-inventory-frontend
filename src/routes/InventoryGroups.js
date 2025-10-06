import React, { useEffect } from 'react';
import InventoryGroups from '../components/InventoryGroups';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Flex, FlexItem } from '@patternfly/react-core';
import InventoryGroupsPopover from '../components/InventoryGroups/SmallComponents/Popover';

const Groups = () => {
  const chrome = useChrome();

  /*eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    chrome?.hideGlobalFilter?.(true);
    chrome?.updateDocumentTitle?.(`Workspaces - Inventory`);
  }, []);
  /*eslint-enable react-hooks/exhaustive-deps */

  return (
    <React.Fragment>
      <PageHeader>
        <Flex
          style={{ alignItems: 'center' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem>
            <PageHeaderTitle
              title="Workspaces"
              data-ouia-component-id="workspaces-header-title"
            />
          </FlexItem>
          <FlexItem>
            <InventoryGroupsPopover />
          </FlexItem>
        </Flex>
      </PageHeader>
      <InventoryGroups />
    </React.Fragment>
  );
};

export default Groups;
