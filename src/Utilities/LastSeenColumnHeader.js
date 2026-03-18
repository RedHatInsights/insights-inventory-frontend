import React from 'react';
import { Flex, FlexItem, Icon, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

export const LastSeenColumnHeader = () => {
  return (
    <Flex display={{ default: 'inlineFlex' }}>
      <FlexItem spacer={{ default: 'spacerXs' }}>Last seen</FlexItem>
      <FlexItem>
        <Tooltip
          content={`Last seen represents the most recent time a system
          checked in and uploaded sufficient data for Red Hat Lightspeed analysis.
          The timestamps may vary between applications as they rely on
          different data collectors.`}
        >
          <Icon status="custom">
            <OutlinedQuestionCircleIcon color="var(--pf-t--global--icon--color--subtle)" />
          </Icon>
        </Tooltip>
      </FlexItem>
    </Flex>
  );
};
