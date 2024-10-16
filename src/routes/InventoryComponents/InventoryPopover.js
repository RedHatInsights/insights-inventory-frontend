import React from 'react';
import {
  Button,
  Flex,
  Popover,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
export const InventoryPopover = () => {
  return (
    <Popover
      aria-label="Inventory popover"
      headerContent={<Title headingLevel="h4">{'About inventory'}</Title>}
      position="right"
      maxWidth="450px"
      bodyContent={
        <TextContent>
          <Flex direction={{ default: 'column' }}>
            <Text component={TextVariants.p}>
              Inventory offers a centralized, detailed overview of all systems
              within your organization, enabling tracking and management of your
              infrastructure.
            </Text>
            <Text component={TextVariants.p}>
              To appear in Inventory, systems must first be registered with Red
              Hat. You can register systems using several methods, including the
              Red Hat Insights client, Red Hat Satellite, or Red Hat
              Subscription Manager (RHSM).
            </Text>
            <Text>
              As a systems administrator, you have the flexibility to define
              when systems are marked as stale, and set the duration for system
              inactivity before they are automatically removed from the
              inventory.
            </Text>
            <span>
              <Link
                to={
                  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/viewing_and_managing_system_inventory/index'
                }
              >
                Viewing and managing system inventory
                <ExternalLinkAltIcon className="pf-v5-u-ml-xs" />
              </Link>
            </span>

            <span>
              <Link
                to={
                  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/client_configuration_guide_for_red_hat_insights/index'
                }
              >
                Client configuration guide for Red Hat Insights
                <ExternalLinkAltIcon className="pf-v5-u-ml-xs" />
              </Link>
            </span>

            <span>
              <Link to={'tba'}>
                Managing system staleness and deletion
                <ExternalLinkAltIcon className="pf-v5-u-ml-xs" />
              </Link>
            </span>
          </Flex>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Open Inventory groups popover"
        style={{ padding: 0 }}
      >
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  );
};
