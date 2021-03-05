import React from 'react';
import PropTypes from 'prop-types';

/**
 * Box tandard react component
 */
const SampleSharedComponent = ({ someProp }) => {
    return (
        <div>
            <h1>SampleSharedComponent from inventory</h1>
            <h2>Input prop: {someProp}</h2>
        </div>
    );
};

SampleSharedComponent.propTypes = {
    someProp: PropTypes.node.isRequired
};

/**
 * MUST USE DEFAULT EXPORT
 * Based on React.lazy API
 */
export default SampleSharedComponent;
