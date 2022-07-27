import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import LoadingFallback from '../components/SpinnerFallback';

import { inventoryConnector } from '../Utilities/inventoryConnector';
import * as storeMod from '../store/redux';
import * as utils from '../Utilities/index';
import * as apiMod from '../api/index';
const { mergeWithDetail, ...rest } = storeMod;

const ConnectorWithFallBack = ({ componentName, Component, innerRef, ...props }) =>
    (Component && componentName) ?
        <Component {...props} fallback={<LoadingFallback />} ref={innerRef} /> : 'No AsyncComponent "' + componentName + '"';

ConnectorWithFallBack.propTypes = {
    componentName: PropTypes.string,
    Component: PropTypes.node,
    innerRef: PropTypes.shape({
        current: PropTypes.any
    })
};

const AsyncInventory = ({ componentName, onLoad, store, history, ...props }) => {
    const { [componentName]: Component } = useMemo(() => (
        inventoryConnector(store, undefined, undefined, true)
    ), [componentName]);

    useEffect(() => {
        componentName && onLoad?.({
            ...rest,
            ...utils,
            api: apiMod,
            mergeWithDetail
        });
    }, [componentName]);

    return (
        <RBACProvider appName="inventory">
            <Provider store={store}>
                <Router history={history}>
                    <ConnectorWithFallBack {...props} componentName={componentName} Component={Component} />
                </Router>
            </Provider>
        </RBACProvider>
    );
};

AsyncInventory.propTypes = {
    store: PropTypes.object,
    onLoad: PropTypes.func,
    componentName: PropTypes.string,
    history: PropTypes.object
};

AsyncInventory.defaultProps = {
    onLoad: () => undefined
};

export default AsyncInventory;
