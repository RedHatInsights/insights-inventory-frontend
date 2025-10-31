import React from 'react';
import PropTypes from 'prop-types';
import GeneralInformation from '../GeneralInfo/GeneralInformation';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
export { default as TextInputModal } from '../GeneralInfo/TextInputModal';

const GeneralInfoTab = ({ entity, ...props }) => {
  const enableRuntimesInventoryCard = useFeatureFlag(
    'runtimes.inventory-card.enabled',
  );

  return (
    <GeneralInformation
      {...props}
      isBootcHost={!!entity.system_profile?.bootc_status?.booted?.image_digest}
      showRuntimesProcesses={enableRuntimesInventoryCard}
      entity={entity}
    />
  );
};

GeneralInfoTab.propTypes = {
  entity: PropTypes.object,
};

export default GeneralInfoTab;
