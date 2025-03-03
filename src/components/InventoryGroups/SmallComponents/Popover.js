import {
  Button,
  Popover,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import React from 'react';

const InventoryGroupsPopover = () => (
    <Popover
      aria-label="Inventory Groups popover"
      headerContent={
        <Title headingLevel="h4">
          Workspaces
        </Title>
      }
      position="right"
      bodyContent={
        <TextContent>
          <Text component={TextVariants.p}>
            Workspaces allow you to select specific systems and
            group them together to better organize your inventory.
          </Text>
          <Text component={TextVariants.p}>
            You can also manage user access to specific workspaces
            to enhance security within your organization.
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Open Inventory groups popover"
        style={{ padding: 0 }}
        ouiaId="AboutInventoryWorkspacesPopover"
      >
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  );

export default InventoryGroupsPopover;
