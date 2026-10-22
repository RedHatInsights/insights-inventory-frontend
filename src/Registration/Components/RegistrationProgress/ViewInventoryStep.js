import React from 'react';
import { Content } from '@patternfly/react-core';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

const ViewInventoryStep = () => {
  return (
    <React.Fragment>
      <Content>
        <Content component="ul" isPlainList>
          <Content component="li">
            <span>
              Navigate to the{' '}
              <InsightsLink to="/" app="inventory">
                Systems Inventory page
              </InsightsLink>
            </span>
            <br />
            <span>
              It can take a couple of minutes for your system to appear.
            </span>
          </Content>
        </Content>
      </Content>
    </React.Fragment>
  );
};

export default ViewInventoryStep;
