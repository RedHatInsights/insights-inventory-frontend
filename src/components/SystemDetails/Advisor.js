import React from 'react';
import { useStore } from 'react-redux';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import PropTypes from 'prop-types';

const AdvisorTab = ({ inventoryId }) => {
    return <AsyncComponent
        appName="advisor"
        module="./SystemDetail"
        store={useStore()}
        customItnl
        intlProps={{
            locale: navigator.language.slice(0, 2)
        }}
        inventoryId={inventoryId}
    />;
};

AdvisorTab.propTypes = {
    inventoryId: PropTypes.string.isRequired
};
export default AdvisorTab;
