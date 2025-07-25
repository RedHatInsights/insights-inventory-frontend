import { Button, Label, Popover, Content } from '@patternfly/react-core';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';
import React from 'react';

const ConversionPopover = () => {
  const navigate = useInsightsNavigate('tasks');

  return (
    <Popover
      hasAutoWidth
      aria-label="CentOS conversion alert popover"
      headerContent={'Convert this system to RHEL'}
      bodyContent={
        <Content>
          <Content
            component="p"
            style={{ maxWidth: '380px', fontSize: '14px' }}
          >
            As of June 30, 2024, CentOS Linux 7 has reached end of life (EOL).
          </Content>
          <Content
            component="p"
            style={{ maxWidth: '380px', fontSize: '14px' }}
          >
            Red Hat can help migrate CentOS Linux 7 users to maintain continuity
            in their environment after the EOL date, whether they’re on premise
            or in the cloud.
          </Content>
          <Content component="p" style={{ fontSize: '14px' }}>
            <a
              href="https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/centos-migration"
              target="_blank"
              rel="noreferrer"
            >
              Learn more about CentOS Migration
            </a>
          </Content>
        </Content>
      }
      footerContent={
        <Button
          variant="secondary"
          onClick={() => navigate('/available/convert-to-rhel-analysis')}
        >
          Run a pre-conversion analysis of this system
        </Button>
      }
    >
      <Label
        isCompact
        color="teal"
        style={{ cursor: 'pointer', marginLeft: '8px' }}
      >
        Convert system to RHEL
      </Label>
    </Popover>
  );
};

export { ConversionPopover };
