import {
  Button,
  Popover,
  Content,
  ContentVariants,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import React from 'react';

const InventoryGroupsPopover = () => (
  <Popover
    aria-label="Inventory Groups popover"
    headerContent={<Title headingLevel="h4">About workspaces</Title>}
    position="right"
    bodyContent={
      <>
        <Content>
          <Content component={ContentVariants.p}>
            Workspaces allow you to select specific systems and group them
            together to better organize your inventory.
          </Content>
          <Content component={ContentVariants.p}>
            You can also manage user access to specific workspaces to enhance
            security within your organization.
          </Content>
        </Content>
        <span>
          <a
            href={
              'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html/viewing_and_managing_system_inventory/deploying-insights-with-rhca_user-access'
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about managing workspaces and user access
            <ExternalLinkAltIcon aria-hidden="true" focusable="false" className="pf-v6-u-ml-xs" />
          </a>
        </span>
      </>
    }
  >
    <Button
      icon={<OutlinedQuestionCircleIcon />}
      variant="plain"
      aria-label="Open Inventory groups popover"
      ouiaId="AboutInventoryWorkspacesPopover"
    />
  </Popover>
);

export default InventoryGroupsPopover;
