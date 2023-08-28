import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import PropTypes from 'prop-types';
import React from 'react';
import AccessDenied from './Utilities/AccessDenied';
import {
  AdvisorTab,
  ComplianceTab,
  PatchTab,
  RosTab,
  VulnerabilityTab,
} from './components/SystemDetails';
import { TAB_REQUIRED_PERMISSIONS } from './constants';

const ApplicationTab = ({ appName, title, ...props }) => {
  const { hasAccess } = usePermissionsWithContext(
    TAB_REQUIRED_PERMISSIONS[appName]
  );

  const tabs = {
    advisor: AdvisorTab,
    vulnerability: VulnerabilityTab,
    compliance: ComplianceTab,
    patch: PatchTab,
    ros: RosTab,
  };

  const Tab = tabs[appName];

  return hasAccess ? (
    <Tab {...props} />
  ) : (
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
};

ApplicationTab.propTypes = {
  title: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
};

export default ApplicationTab;
