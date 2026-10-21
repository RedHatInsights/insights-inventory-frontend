import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Content, ContentVariants } from '@patternfly/react-core';
import * as constants from '../../constants';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import RegAssistCodeBlock from '../RegAssistCodeBlock/RegAssistCodeBlock';
import ViewInventoryStep from './ViewInventoryStep';
import { useLightspeedFeatureFlag } from '../../Utilities/Hooks';

const CentosLinuxRegContent = ({ orgId, selectedKey, setStep }) => {
  const platformName = useLightspeedFeatureFlag();

  return (
    <Content>
      <Content component={ContentVariants.p}>
        {constants[`centosRegister${platformName}`]}{' '}
        <Content
          component={ContentVariants.a}
          href={constants.convertLinuxToRHEL}
          rel="noopener noreferrer"
          target="_blank"
        >
          {platformName === 'Lightspeed'
            ? 'Converting using Red Hat Lightspeed'
            : 'Converting using Insights'}
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
          Install{' '}
          <Content
            component={ContentVariants.a}
            href={constants.remoteHostConfigLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            Remote host configuration
            <Icon className="pf-v6-u-ml-xs">
              <ExternalLinkAltIcon color="var(--pf-t--global--text--color--link--default)" />
            </Icon>
          </Content>
          <RegAssistCodeBlock
            code={constants.centosInstallRHC}
            setStep={setStep}
          />
        </Content>
        <Content component="li">
          {constants[`connectTo${platformName}`]}.
          <RegAssistCodeBlock
            code={constants.rhcConnect(selectedKey, orgId)}
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

CentosLinuxRegContent.propTypes = {
  orgId: PropTypes.string,
  selectedKey: PropTypes.string,
  setStep: PropTypes.func,
};

export default CentosLinuxRegContent;
