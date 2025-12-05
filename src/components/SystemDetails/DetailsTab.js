import React from 'react';
import PropTypes from 'prop-types';
import Details from './Details';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

const DetailsTab = ({ entity, ...props }) => {
  const enableRuntimesInventoryCard = useFeatureFlag(
    'runtimes.inventory-card.enabled',
  );

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
      showRuntimesProcesses={enableRuntimesInventoryCard}
      entity={entity}
    />
  );
};

DetailsTab.propTypes = {
  entity: PropTypes.object,
};

export default DetailsTab;
