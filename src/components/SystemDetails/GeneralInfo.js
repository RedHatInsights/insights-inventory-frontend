import React from 'react';
import { useSelector } from 'react-redux';
import GeneralInformation from '../GeneralInfo/GeneralInformation';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
export { default as TextInputModal } from '../GeneralInfo/TextInputModal';

const GeneralInfoTab = (props) => {
  const systemProfile = useSelector(
    ({ systemProfileStore }) => systemProfileStore?.systemProfile,
  );
  const isBootcHost = !!systemProfile.bootc_status?.booted?.image_digest;
  const enableRuntimesInventoryCard = useFeatureFlag(
    'runtimes.inventory-card.enabled',
  );

  return (
    <GeneralInformation
      {...props}
      isBootcHost={isBootcHost}
      showRuntimesProcesses={enableRuntimesInventoryCard}
    />
  );
};

export default GeneralInfoTab;
