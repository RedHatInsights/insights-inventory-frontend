import { useConditionalRBAC } from './Utilities/hooks/useConditionalRBAC';
import PropTypes from 'prop-types';
import React from 'react';
import AccessDenied from './Utilities/AccessDenied';
import { NotConnected } from '@redhat-cloud-services/frontend-components/NotConnected';
import {
  AdvisorTab,
  ComplianceTab,
  PatchTab,
  RosTab,
  VulnerabilityTab,
} from './components/SystemDetails';
import { TAB_REQUIRED_PERMISSIONS } from './constants';

const ApplicationTab = ({
  appName,
  title,
  insightsDisconnected = false,
  ...props
}) => {
  const { hasAccess, isOrgAdmin } = useConditionalRBAC(
    TAB_REQUIRED_PERMISSIONS[appName],
    true, // all must be fulfilled
    false,
  );

  const tabs = {
    advisor: AdvisorTab,
    vulnerability: VulnerabilityTab,
    compliance: ComplianceTab,
    patch: PatchTab,
    ros: RosTab,
  };

  const Tab = tabs[appName];

  if (!hasAccess && !isOrgAdmin) {
    return (
      <AccessDenied
        requiredPermission={TAB_REQUIRED_PERMISSIONS[appName].join(', ')}
        description={
          <div>
            Contact your organization administrator(s) for more information.
          </div>
        }
        title={`You do not have access to ${title}`}
      />
    );
  }

  if (insightsDisconnected) {
    return <NotConnected />;
  }

  return <Tab {...props} />;
};

ApplicationTab.propTypes = {
  title: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  insightsDisconnected: PropTypes.bool,
};

export default ApplicationTab;
