import React from 'react';

import GeneralInformation from '../GeneralInfo/GeneralInformation';
export { default as TextInputModal } from '../GeneralInfo/TextInputModal';

const GeneralInfoTab = (props) => {
    return <GeneralInformation  {...props} />;
};

export default GeneralInfoTab;
