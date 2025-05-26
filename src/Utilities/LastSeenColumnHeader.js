import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import useFeatureFlag from './useFeatureFlag';

export const LastSeenColumnHeader = () => {
  const isLastCheckInEnabled = useFeatureFlag(
    'hbi.create_last_check_in_update_per_reporter_staleness',
  );
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
              style={{ verticalAlign: -2 }}
            />
          </Icon>
        </Tooltip>
      )}
    </span>
  );
};
