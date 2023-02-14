import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import RegistryContext from '../../store/registeryContext';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const PatchTab = ({ inventoryId }) => {
    const { getRegistry } = useContext(RegistryContext);

    return <AsyncComponent
        appName="patch"
        module="./SystemDetail"
        //inventoryId is a requred prop by Patch module
        inventoryId={inventoryId}
        getRegistry={getRegistry}
    />;
};

PatchTab.propTypes = {
    inventoryId: PropTypes.string.isRequired
};
export default PatchTab;
