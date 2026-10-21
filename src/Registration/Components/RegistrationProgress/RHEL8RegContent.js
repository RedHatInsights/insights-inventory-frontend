import React from 'react';
import PropTypes from 'prop-types';
import { Content, ContentVariants } from '@patternfly/react-core';
import RegAssistCodeBlock from '../RegAssistCodeBlock/RegAssistCodeBlock';
import * as constants from '../../constants';
import ViewInventoryStep from './ViewInventoryStep';
import { useLightspeedFeatureFlag } from '../../Utilities/Hooks';

const RHEL8RegContent = ({ orgId, selectedKey, setStep }) => {
  const platformName = useLightspeedFeatureFlag();

  return (
    <Content>
      <Content component="ul" isPlainList>
        <Content component="li">
          <span>{constants.contentRunCommands}</span>
        </Content>
      </Content>
      <Content component={ContentVariants.ol}>
        <Content component="li">
          <span>Connect your system to the subscription manager.</span>
          <br />
          <span>
            This provides a basic level of connectivity in{' '}
            {platformName === 'Lightspeed' ? 'Red Hat Lightspeed' : 'Insights'}.
          </span>
          <RegAssistCodeBlock
            code={constants.subManagerRegister(selectedKey, orgId)}
            setStep={setStep}
          />
        </Content>
        <Content component="li">
          <span>{constants[`connectTo${platformName}`]}</span>
          <br />
          <span>
            This allows{' '}
            {platformName === 'Lightspeed' ? 'Red Hat Lightspeed' : 'Insights'}{' '}
            to provide analytics.
          </span>
          <RegAssistCodeBlock
            code={constants.insightsClientRegister}
            setStep={setStep}
          />
        </Content>
        <Content component="li">
          <ViewInventoryStep />
        </Content>
      </Content>
    </Content>
  );
};

RHEL8RegContent.propTypes = {
  orgId: PropTypes.string,
  selectedKey: PropTypes.string,
  setStep: PropTypes.func,
};

export default RHEL8RegContent;
