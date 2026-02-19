import React from 'react';
import { Button, Flex, Popover, Title } from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';

export const HostStalenessPopover = () => {
  return (
    <Popover
      aria-label="Organization level popover"
      headerContent={
        <Title headingLevel="h4">About system staleness and deletion</Title>
      }
      hasAutoWidth
      position="top"
      bodyContent={
        <Flex direction={{ default: 'column' }}>
          <p className="pf-v6-u-font-size-sm">
            Configure how long systems can go without checking in before they
            are flagged or removed from your inventory. These settings apply to
            all systems in your organization.
          </p>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span className="pf-v6-u-font-size-sm">Default settings:</span>
            <span className="pf-v6-u-font-size-sm">
              - Systems are marked as stale after 1 day since last check-in.
            </span>
            <span className="pf-v6-u-font-size-sm">
              - Systems are marked as stale warning after 7 days since last
              check-in.
            </span>
            <span className="pf-v6-u-font-size-sm">
              - Systems are deleted after 30 days since last check-in.
            </span>
          </Flex>
          <span>
            <a
              href={
                'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/viewing_and_managing_system_inventory/index#systems-lifecycle_user-access'
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Managing system staleness and deletion
              <ExternalLinkAltIcon
                aria-hidden="true"
                className="pf-v6-u-ml-xs"
              />
            </a>
          </span>
        </Flex>
      }
    >
      <Button
        icon={<OutlinedQuestionCircleIcon />}
        className="pf-v6-u-ml-sm"
        variant="plain"
        aria-label="Organization level popover"
        style={{ padding: 0 }}
      />
    </Popover>
  );
};

export default HostStalenessPopover;
