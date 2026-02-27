import React from 'react';
import { Button, Flex, Popover, Title } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

export const HostStalenessResetPopover = () => {
  return (
    <Popover
      aria-label="Organization level popover"
      headerContent={<Title headingLevel="h4">Default settings</Title>}
      position="left"
      bodyContent={
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsNone' }}
        >
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
      }
    >
      <Button
        icon={<OutlinedQuestionCircleIcon />}
        className="pf-v6-u-ml-sm"
        variant="plain"
        aria-label="Reset to system default"
        style={{ padding: 0 }}
      />
    </Popover>
  );
};

export default HostStalenessResetPopover;
