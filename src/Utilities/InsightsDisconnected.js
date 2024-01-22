import React from 'react';

import { Grid, GridItem, Tooltip } from '@patternfly/react-core';
import { DisconnectedIcon } from '@patternfly/react-icons';

import './InsightsDisconnected.scss';

const InsightsDisconnected = () => (
  <Tooltip
    maxWidth="14rem"
    content={
      <Grid hasGutter>
        <GridItem>Insights client not reporting</GridItem>
        <GridItem>
          From the main navigation, open &quot;Registration Assistant&quot; to
          learn how to set up Insights.
        </GridItem>
      </Grid>
    }
  >
    <span
      className="pf-u-ml-sm ins-c-inventor__disconnected-icon"
      aria-label="Disconnected indicator"
    >
      <DisconnectedIcon />
    </span>
  </Tooltip>
);

export default InsightsDisconnected;
