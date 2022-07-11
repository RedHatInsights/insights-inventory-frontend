import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { RBACProvider } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import LoadingFallback from '../components/SpinnerFallback';

import { inventoryConnector } from '../Utilities/inventoryConnector';
import * as storeMod from '../store/redux';
import * as utils from '../Utilities/index';
import * as apiMod from '../api/index';

const AsyncInventory = ({ componentName, onLoad, store, history, innerRef, ...props }) => {
    const [Component, setComponent] = useState();
    useEffect(() => {
        const [{ mergeWithDetail, ...rest }, shared, api] = [
            storeMod,
            utils,
            apiMod
        ];
        const { [componentName]: InvCmp } = inventoryConnector(store, undefined, undefined, true);

        onLoad({
            ...rest,
            ...shared,
            api,
            mergeWithDetail
        });

        setComponent(() => InvCmp);

    }, [componentName]);

    return (
        <Provider store={store}>
            <Router history={history}>
                <RBACProvider appName="inventory">
                    {Component && <Component {...props} fallback={LoadingFallback} ref={innerRef} />}
                </RBACProvider>
            </Router>
        </Provider>
    );
};

AsyncInventory.propTypes = {
    store: PropTypes.object,
    onLoad: PropTypes.func,
    componentName: PropTypes.string,
    history: PropTypes.object,
    innerRef: PropTypes.shape({
        current: PropTypes.any
    })
};

AsyncInventory.defaultProps = {
    onLoad: () => undefined
};

export default AsyncInventory;
