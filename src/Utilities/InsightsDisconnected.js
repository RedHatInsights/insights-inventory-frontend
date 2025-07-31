import React from 'react';

import { Grid, GridItem, Icon, Tooltip } from '@patternfly/react-core';
import { DisconnectedIcon } from '@patternfly/react-icons';

import './InsightsDisconnected.scss';

const InsightsDisconnected = () => {
  return (
    <Tooltip
      maxWidth="14rem"
      content={
        <Grid hasGutter>
          <GridItem>Insights client not reporting</GridItem>
          <GridItem>
            From the main navigation, open &quot;Register Systems&quot; to learn
            how to set up Insights.
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
