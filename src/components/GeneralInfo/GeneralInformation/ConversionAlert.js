import { Alert, Text, TextContent, TextVariants } from '@patternfly/react-core';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';
import React from 'react';

const ConversionAlert = (props) => {
  const navigate = useInsightsNavigate('tasks');

  return (
    <Alert
      variant="custom"
      isInline
      title="Convert this CentOS system to RHEL"
      {...props}
    >
      <TextContent>
        <Text component={TextVariants.p}>
          As of June 30, 2024, CentOS Linux 7 has reached end of life (EOL).
          Convert your system to RHEL using the Convert2RHEL tool to migrate
          your system to a fully supported production-grade operating system
          while maintaining existing OS customizations, configurations, and
          preferences.
        </Text>
        <Text component={TextVariants.p}>
          Red Hat can help migrate CentOS Linux 7 users to maintain continuity
          in their environment after the EOL date, whether they’re on premise or
          in the cloud.{' '}
          <a
            href="https://www.redhat.com/en/technologies/linux-platforms/enterprise-linux/centos-migration"
            target="_blank"
            rel="noreferrer"
          >
            Learn more about CentOS Migration here.
          </a>
        </Text>
        <Text component={TextVariants.p}>
          <a onClick={() => navigate('/available/convert-to-rhel-analysis')}>
            Run a Pre-conversion analysis of this system
          </a>
        </Text>
      </TextContent>
    </Alert>
  );
};

export { ConversionAlert };
