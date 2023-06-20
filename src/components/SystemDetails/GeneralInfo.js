import React from 'react';

import GeneralInformation from '../GeneralInfo/GeneralInformation';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
export { default as TextInputModal } from '../GeneralInfo/TextInputModal';

const GeneralInfoTab = (props) => {
    const enableEdgeImageDetails = useFeatureFlag('edgeParity.inventory-system-detail');
    const enableEdgeInventoryListDetails = useFeatureFlag('edgeParity.inventory-list');
    return <GeneralInformation  {...props} showImageDetails={enableEdgeImageDetails}/>;
};

export default GeneralInfoTab;
