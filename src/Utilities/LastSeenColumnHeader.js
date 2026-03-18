import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

export const LastSeenColumnHeader = () => {
  return (
    <span>
      Last seen
      <Tooltip
        content={`Last seen represents the most recent time a system
          checked in and uploaded sufficient data for Red Hat Lightspeed analysis.
          The timestamps may vary between applications as they rely on
          different data collectors.`}
      >
        <Icon status="custom" class="pf-v6-u-ml-xs">
          <OutlinedQuestionCircleIcon color="var(--pf-t--global--icon--color--subtle)" />
        </Icon>
      </Tooltip>
    </span>
  );
};
