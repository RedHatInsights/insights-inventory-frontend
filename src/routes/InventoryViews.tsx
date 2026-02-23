import React, { useContext, useState } from 'react';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import SystemsView from '../components/SystemsView';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { InventoryPopover } from './InventoryComponents/InventoryPopover';
import { OutageAlert } from '../components/OutageAlert';
import SystemsViewToggle from '../components/SystemsView/SystemsViewToggle';
import { AccountStatContext } from '../Contexts';

interface InventoryViewsProps {
  hasAccess?: boolean;
}

export type View = 'systems' | 'images';

const InventoryViews = ({ hasAccess }: InventoryViewsProps) => {
  const [view, setView] = useState<View>('systems');
  const { hasBootcImages } = useContext(AccountStatContext);

  return (
    <>
      <PageHeader>
        <PageHeaderTitle
          title={
            <Flex
              style={{ alignItems: 'center' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>Systems View</FlexItem>
              <FlexItem>
                <InventoryPopover />
              </FlexItem>
            </Flex>
          }
          actionsContent={
            hasBootcImages && (
              <SystemsViewToggle view={view} setView={setView} />
            )
          }
        />
        <OutageAlert />
      </PageHeader>
      <PageSection hasBodyWrapper={false}>
        {view === 'systems' ? <SystemsView hasAccess={hasAccess} /> : null}
      </PageSection>
    </>
  );
};

export default InventoryViews;
