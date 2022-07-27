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

const AsyncInventory = ({ componentName, onLoad, store, history, innerRef, ...props }) => {
    const { [componentName]: Component } = useMemo(() => inventoryConnector(store, undefined, undefined, true), [componentName]);

    useEffect(() => {
        const { mergeWithDetail, ...rest } = storeMod;
        onLoad?.({
            ...rest,
            ...utils,
            api: apiMod,
            mergeWithDetail
        });
    }, []);

    return (
        <Provider store={store}>
            <RBACProvider appName="inventory">
                <Router history={history}>
                    <Component {...props} fallback={<LoadingFallback />} ref={innerRef} />
                </Router>
            </RBACProvider>
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
