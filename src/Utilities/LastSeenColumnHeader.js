import React, { useContext } from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { AccountStatContext } from '../Contexts';

export const LastSeenColumnHeader = () => {
  const isLastCheckInEnabled = useContext(AccountStatContext);
  return (
    <span>
      Last seen
      {isLastCheckInEnabled && (
        <Tooltip
          content="Last seen represents the most recent time a system
          checked in and uploaded sufficient data for Insights analysis.
          The timestamps may vary between applications as they rely on
          different data collectors."
        >
          <Icon>
            <OutlinedQuestionCircleIcon
              className="pf-v5-u-ml-sm"
              color="var(--pf-v5-global--secondary-color--100)"
            />
          </Icon>
        </Tooltip>
      )}
    </span>
  );
};
