import {
  Button,
  Label,
  Popover,
  Text,
  TextContent,
} from '@patternfly/react-core';
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
        <TextContent>
          <Text style={{ maxWidth: '380px' }}>
            On June 30, 2024, CentOS Linux 7 will reach End of Life (EOL).
          </Text>
          <Text style={{ maxWidth: '380px' }}>
            Red Hat can help migrate CentOS Linux 7 users to maintain continuity
            in their environment after the EOL date, whether they’re on premise
            or in the cloud.
          </Text>
          <Text>
            <a
              href="https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/centos-migration"
              target="_blank"
              rel="noreferrer"
            >
              Learn more about CentOS Migration
            </a>
          </Text>
        </TextContent>
      }
      footerContent={
        <Button
          variant="secondary"
          onClick={() => navigate('/available#pre-conversion-analysis')}
        >
          Run a pre-conversion analysis of this system
        </Button>
      }
    >
      <Label isCompact color="cyan">
        Convert system to RHEL
      </Label>
    </Popover>
  );
};

export { ConversionPopover };
