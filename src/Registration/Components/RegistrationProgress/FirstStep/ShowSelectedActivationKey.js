import React from 'react';
import PropTypes from 'prop-types';
import {
  ExpandableSection,
  Content,
  ContentVariants,
} from '@patternfly/react-core';

export const ShowSelectedActivationKey = ({ selectedKey }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const onToggle = (_event, isExpanded) => {
    setIsExpanded(isExpanded);
  };

  return (
    <ExpandableSection
      toggleText="Show selected activation key"
      onToggle={onToggle}
      isExpanded={isExpanded}
    >
      <Content className="pf-v6-u-ml-lg">
        <Content component={ContentVariants.dl}>
          <Content component={ContentVariants.dt}>Name</Content>
          <Content component={ContentVariants.dd}>
            {selectedKey.name || 'Not defined'}
          </Content>
          <Content component={ContentVariants.dt}>Description</Content>
          <Content component={ContentVariants.dd}>
            {selectedKey.description || 'Not defined'}
          </Content>
          <Content component={ContentVariants.dt}>Workload</Content>
          <Content component={ContentVariants.dd}>
            {selectedKey.releaseVersion || 'Not defined'}
          </Content>
          <Content component={ContentVariants.dt}>Role</Content>
          <Content component={ContentVariants.dd}>
            {selectedKey.role || 'Not defined'}
          </Content>
          <Content component={ContentVariants.dt}>
            Service level agreement(SLA)
          </Content>
          <Content component={ContentVariants.dd}>
            {selectedKey.serviceLevel || 'Not defined'}
          </Content>
          <Content component={ContentVariants.dt}>Usage</Content>
          <Content component={ContentVariants.dd}>
            {selectedKey.usage || 'Not defined'}
          </Content>
        </Content>
      </Content>
    </ExpandableSection>
  );
};

ShowSelectedActivationKey.propTypes = {
  selectedKey: PropTypes.object,
};
