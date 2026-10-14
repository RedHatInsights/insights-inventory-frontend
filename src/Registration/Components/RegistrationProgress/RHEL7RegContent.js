import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Content, ContentVariants } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import RegAssistCodeBlock from '../RegAssistCodeBlock/RegAssistCodeBlock';
import * as constants from '../../constants';
import ViewInventoryStep from './ViewInventoryStep';
import { useLightspeedFeatureFlag } from '../../Utilities/Hooks';

const RHEL7RegContent = ({ orgId, selectedKey, setStep }) => {
  const platformName = useLightspeedFeatureFlag();

  return (
    <Content>
      <Content component={ContentVariants.p}>
        {`RHEL 7's maintenance support phase has ended.`}{' '}
        <Content
          component={ContentVariants.a}
          href={constants.rhel7LifecycleSupport}
          rel="noopener noreferrer"
          target="_blank"
        >
          Red Hat Enterprise Linux 7 Extended Lifecycle Support Maintenance
          Policy
          <Icon className="pf-v6-u-ml-xs">
            <ExternalLinkAltIcon color="var(--pf-t--global--text--color--link--default)" />
          </Icon>
        </Content>
      </Content>
      <Content component="ul" isPlainList>
        <Content component="li">
          <span>{constants.contentRunCommands}</span>
        </Content>
      </Content>
      <Content component={ContentVariants.ol}>
        <Content component="li">
          <span>Connect your system to the subscription manager</span>
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
          Install the insights-client tool.
          <RegAssistCodeBlock
            code={constants.yumInstallInsightsClient}
            setStep={setStep}
          />
        </Content>
        <Content component="li">
          <span>{constants[`connectTo${platformName}`]}</span>
          <br />
          <span>
            This allows{' '}
            {platformName === 'Lightspeed' ? 'Red Hat Lightspeed' : 'Insights'}{' '}
            to provide recommendations.
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

RHEL7RegContent.propTypes = {
  orgId: PropTypes.string,
  selectedKey: PropTypes.string,
  setStep: PropTypes.func,
};

export default RHEL7RegContent;
