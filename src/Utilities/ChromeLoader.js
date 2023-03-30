import React from 'react';
import PropTypes from 'prop-types';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const ChromeLoader = ({ children }) => {
    const chrome = useChrome();

    return <>
        {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { chrome });
            }

            return child;
        })}
    </>;
};

ChromeLoader.propTypes = {
    children: PropTypes.any
};

export default ChromeLoader;
