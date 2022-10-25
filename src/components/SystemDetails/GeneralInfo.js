import React, { useEffect, useState, Fragment } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import GeneralInformation from '../GeneralInfo/GeneralInformation';
export { default as TextInputModal } from '../GeneralInfo/TextInputModal';
import Fallback from '../SpinnerFallback';
import systemProfileStore from '../../store/systemProfileStore';

const GeneralInfoTab = ({ getRegistry, ...props }) => {
    const [Wrapper, setWrapper] = useState();
    useEffect(() => {
        if (getRegistry) {
            getRegistry()?.register?.({ systemProfileStore });
        }

        setWrapper(() => getRegistry ? Provider : Fragment);
    }, []);
    return Wrapper ? <Wrapper
        {...getRegistry && {
            store: getRegistry().getStore()
        }}
    >
        <GeneralInformation {...props} />
    </Wrapper> : <Fallback />;
};

GeneralInfoTab.propTypes = {
    getRegistry: PropTypes.func
};

export default GeneralInfoTab;
