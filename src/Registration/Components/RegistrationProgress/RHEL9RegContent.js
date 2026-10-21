import React from 'react';
import PropTypes from 'prop-types';
import { Content, ContentVariants } from '@patternfly/react-core';
import RegAssistCodeBlock from '../RegAssistCodeBlock/RegAssistCodeBlock';
import * as constants from '../../constants';
import ViewInventoryStep from './ViewInventoryStep';
import { useLightspeedFeatureFlag } from '../../Utilities/Hooks';

const RHEL9RegContent = ({ orgId, selectedKey, setStep }) => {
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
          <span>{constants[`connectTo${platformName}`]}</span>
          <br />
          <span>
            To register the system with the default feature level and ensure the
            system executes the remediations and tasks from{' '}
            {platformName === 'Lightspeed' ? 'Red Hat Lightspeed' : 'Insights'}:
          </span>
          <RegAssistCodeBlock
            code={constants.rhcConnect(selectedKey, orgId)}
            setStep={setStep}
          />
          <RegAssistCodeBlock
            code={constants.installWorkerPlaybook}
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

RHEL9RegContent.propTypes = {
  orgId: PropTypes.string,
  selectedKey: PropTypes.string,
  setStep: PropTypes.func,
};

export default RHEL9RegContent;
