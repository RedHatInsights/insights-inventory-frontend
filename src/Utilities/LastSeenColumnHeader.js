import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

export const LastSeenColumnHeader = () => (
  <span>
    Last seen
    <Tooltip
      content="Last seen represents the most recent time a system
          checked in and uploaded sufficient data for Insights analysis.
          The timestamp may vary between applications as they rely on
          different data collectors."
    >
      <Icon>
        <OutlinedQuestionCircleIcon
          className="pf-v5-u-ml-sm"
          color="var(--pf-v5-global--secondary-color--100)"
          style={{ verticalAlign: -2 }}
        />
      </Icon>
    </Tooltip>
  </span>
);
