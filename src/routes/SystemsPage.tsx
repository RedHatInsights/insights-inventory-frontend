import React, { useContext, useEffect, useState } from 'react';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { InventoryPopover } from './InventoryComponents/InventoryPopover';
import { OutageAlert } from '../components/OutageAlert';
import SystemsViewToggle from '../components/SystemsView/SystemsViewToggle';
import { AccountStatContext } from '../Contexts';
import { ImagesView } from '../components/InventoryViews/ImagesView/ImagesView';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import './inventory.scss';
import InventoryViews from '../components/InventoryViews/InventoryViews';
import AccessDenied from '../Utilities/AccessDenied';
import useInventoryViewsFeatureFlag from '../Utilities/useInventoryViewsFeatureFlag';

import InventoryHosts from '../components/InventoryViews/InventoryHosts';

interface SystemsPageProps {
  hasAccess?: boolean;
}

export type View = 'systems' | 'images';

const InventoryViewsPage = ({ hasAccess = true }: SystemsPageProps) => {
  const [view, setView] = useState<View>('systems');
  const { hasBootcImages } = useContext(AccountStatContext);
  const chrome = useChrome();
  const isInventoryViewsEnabled = useInventoryViewsFeatureFlag();

  useEffect(() => {
    chrome?.hideGlobalFilter?.(true);
  }, [chrome]);

  if (!hasAccess) {
    return (
      <AccessDenied
        title="This application requires Inventory permissions"
        description={
          <div>
            To view the content of this page, you must be granted a minimum of
            inventory permissions from your Organization Administrator.
          </div>
        }
        requiredPermission="inventory:*:read"
      />
    );
  }

  return (
    <>
      <PageHeader>
        <PageHeaderTitle
          title={
            <Flex
              style={{ alignItems: 'center' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>Systems</FlexItem>
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
        {view === 'systems' ? (
          isInventoryViewsEnabled ? (
            <InventoryViews />
          ) : (
            <InventoryHosts />
          )
        ) : (
          <ImagesView />
        )}
      </PageSection>
    </>
  );
};

export default InventoryViewsPage;
