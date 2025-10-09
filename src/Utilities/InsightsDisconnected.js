import React from 'react';

import { Grid, GridItem, Icon, Tooltip } from '@patternfly/react-core';
import { DisconnectedIcon } from '@patternfly/react-icons';

import './InsightsDisconnected.scss';
import { useLightspeedFeatureFlag } from './hooks/useLightspeedFeatureFlag';

const InsightsDisconnected = () => {
  const platformName = useLightspeedFeatureFlag();
  return (
    <Tooltip
      maxWidth="14rem"
      content={
        <Grid hasGutter>
          <GridItem>Insights client not reporting</GridItem>
          <GridItem>
            From the main navigation, open &quot;Register Systems&quot; to learn
            how to set up{' '}
            {platformName === 'Lightspeed' ? 'Red Hat Lightspeed' : 'Insights'}.
          </GridItem>
        </Grid>
      }
    >
      <Icon
        className="pf-v6-u-ml-sm"
        status={'warning'}
        aria-label="Disconnected indicator"
      >
        <DisconnectedIcon />
      </Icon>
    </Tooltip>
  );
};

export default InsightsDisconnected;
