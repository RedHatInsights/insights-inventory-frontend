import React, { type FC, type ComponentType } from 'react';
import {
  Flex,
  FlexItem,
  Tooltip,
  Icon as PfIcon,
} from '@patternfly/react-core';

export type AdvisoriesIconProps = {
  Icon: ComponentType;
  count?: number;
  tooltipText: string;
};

const AdvisoriesIcon: FC<AdvisoriesIconProps> = ({
  count,
  tooltipText,
  Icon,
}) => (
  <Tooltip content={tooltipText}>
    <Flex style={{ display: 'inline-flex', flexWrap: 'nowrap' }}>
      <FlexItem spacer={{ default: 'spacerSm' }}>
        <PfIcon>
          <Icon />
        </PfIcon>
      </FlexItem>
      <FlexItem spacer={{ default: 'spacerSm' }}>
        {(count && count.toString()) || 0}
      </FlexItem>
    </Flex>
  </Tooltip>
);

export default AdvisoriesIcon;
