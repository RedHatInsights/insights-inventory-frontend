import React, { useEffect, useMemo } from 'react';
import InventoryGroups from '../components/InventoryGroups';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Flex } from '@patternfly/react-core';
import InventoryGroupsPopover from '../components/InventoryGroups/SmallComponents/Popover';
import { useLocation } from 'react-router-dom';
import { getSearchParams } from '../constants';

const Groups = (props) => {
  const chrome = useChrome();
  const { search } = useLocation();
  const searchParams = useMemo(() => getSearchParams(), [search.toString()]);
  const fullProps = { ...props, ...searchParams };

  useEffect(() => {
    chrome?.hideGlobalFilter?.();
    chrome?.updateDocumentTitle?.('Inventory Groups | Red Hat Insights');
  }, []);

  return (
    <React.Fragment>
      <PageHeader>
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <PageHeaderTitle title="Groups" />
          <InventoryGroupsPopover />
        </Flex>
      </PageHeader>
      <InventoryGroups {...fullProps} />
    </React.Fragment>
  );
};

export default Groups;
