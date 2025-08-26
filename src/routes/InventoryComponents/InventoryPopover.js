import React from 'react';
import { Button, Flex, Popover, Content, Title } from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { useLightspeedFeatureFlag } from '../../Utilities/hooks/useLightspeedFeatureFlag';

export const InventoryPopover = () => {
  const platformName = useLightspeedFeatureFlag();
  return (
    <Popover
      aria-label="Inventory popover"
      headerContent={<Title headingLevel="h4">{'About inventory'}</Title>}
      position="right"
      maxWidth="650px"
      bodyContent={
        <Content>
          <Flex direction={{ default: 'column' }}>
            <Content component="p">
              Inventory offers a centralized, detailed overview of all systems
              within your organization, enabling tracking and management of your
              infrastructure.
            </Content>
            <Content component="p">
              To appear in Inventory, systems must first be registered with Red
              Hat. You can register systems using several methods, including the
              Red Hat {platformName} client, Red Hat Satellite, or Red Hat
              Subscription Manager (RHSM).
            </Content>
            <Content component="p">
              As a systems administrator, you have the flexibility to define
              when systems are marked as stale, and set the duration for system
              inactivity before they are automatically removed from the
              inventory.
            </Content>
            <Content component="p">
              To stay informed about changes in your inventory, you can
              configure notifications for inventory events.
            </Content>
            <span>
              <a
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/viewing_and_managing_system_inventory/index'
                }
                target="_blank"
                rel="noreferrer"
              >
                Viewing and managing system inventory
                <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
              </a>
            </span>

            <span>
              <a
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/client_configuration_guide_for_red_hat_insights/index'
                }
                target="_blank"
                rel="noreferrer"
              >
                Client configuration guide for Red Hat {platformName}
                <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
              </a>
            </span>

            <span>
              <a
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/viewing_and_managing_system_inventory/index#systems-lifecycle_user-access'
                }
                target="_blank"
                rel="noreferrer"
              >
                Managing system staleness and deletion
                <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
              </a>
            </span>

            <span>
              <a
                href={
                  'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/viewing_and_managing_system_inventory/configuring-inventory-events_user-access'
                }
                target="_blank"
                rel="noreferrer"
              >
                Configuring notifications for inventory events
                <ExternalLinkAltIcon className="pf-v6-u-ml-xs" />
              </a>
            </span>
          </Flex>
        </Content>
      }
    >
      <Button
        icon={<OutlinedQuestionCircleIcon />}
        variant="plain"
        aria-label="Open Inventory systems popover"
        ouiaId="AboutInventorySystemsPopover"
      />
    </Popover>
  );
};
