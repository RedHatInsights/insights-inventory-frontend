import React, { useContext } from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { AccountStatContext } from '../Contexts';
import { useLightspeedFeatureFlag } from './hooks/useLightspeedFeatureFlag';

export const LastSeenColumnHeader = () => {
  const isLastCheckInEnabled = useContext(AccountStatContext);
  const platformName = useLightspeedFeatureFlag();
  return (
    <span>
      Last seen
      {isLastCheckInEnabled && (
        <Tooltip
          content={`Last seen represents the most recent time a system
          checked in and uploaded sufficient data for ${platformName === 'Lightspeed' ? 'Red Hat Lightspeed' : 'Insights'} analysis.
          The timestamps may vary between applications as they rely on
          different data collectors.`}
        >
          <Icon>
            <OutlinedQuestionCircleIcon
              className="pf-v6-u-ml-sm"
              color="var(--pf-t--global--icon--color--subtle)"
            />
          </Icon>
        </Tooltip>
      )}
    </span>
  );
};
