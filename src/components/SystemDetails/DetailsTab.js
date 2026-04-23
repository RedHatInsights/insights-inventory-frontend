import React from 'react';
import PropTypes from 'prop-types';
import Details from './Details';
import { useKesselMigrationFeatureFlag } from '../../Utilities/hooks/useKesselMigrationFeatureFlag';

const DetailsTab = ({ entity, ...props }) => {
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();
  const showRuntimesProcesses = !isKesselMigrationEnabled;

  if (!entity) {
    console.error('DetailsTab: entity data is missing. Rendering aborted.', {
      props,
    });
    return null;
  }

  return (
    <Details
      {...props}
      isBootcHost={!!entity.system_profile?.bootc_status?.booted?.image_digest}
      showRuntimesProcesses={showRuntimesProcesses}
      entity={entity}
    />
  );
};

DetailsTab.propTypes = {
  entity: PropTypes.object,
};

export default DetailsTab;
