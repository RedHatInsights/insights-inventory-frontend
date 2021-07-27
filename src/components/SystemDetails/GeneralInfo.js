import React, { useEffect, useState, Fragment } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import GeneralInformation from '../GeneralInfo/GeneralInformation';
export { default as TextInputModal } from '../GeneralInfo/TextInputModal';
import fallback from '../SpinnerFallback';

const GeneralInfoTab = ({ getRegisty, ...props }) => {
    const [Wrapper, setWrapper] = useState();
    useEffect(() => {
        setWrapper(() => getRegisty ? Provider : Fragment);
    }, []);
    return Wrapper ? <Wrapper
        {...getRegisty && {
            store: getRegisty().getStore()
        }}
    >
        <GeneralInformation {...props} />
    </Wrapper> : fallback;
};

GeneralInfoTab.propTypes = {
    getRegisty: PropTypes.func
};

export default GeneralInfoTab;
