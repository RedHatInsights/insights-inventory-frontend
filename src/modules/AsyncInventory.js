import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';

import * as storeMod from '../store/redux';
import * as utils from '../Utilities/index';
import * as apiMod from '../api/index';
import RenderWrapper from '../Utilities/Wrapper';
const { mergeWithDetail, ...rest } = storeMod;

const AsyncInventory = ({ component, onLoad, store, history, innerRef, ...props }) => {
    useEffect(() => {
        onLoad?.({
            ...rest,
            ...utils,
            api: apiMod,
            mergeWithDetail
        });
    }, []);

    return (
        <RBACProvider appName="inventory">
            <Provider store={store}>
                <Router history={history}>
                    <RenderWrapper
                        { ...props }
                        isRbacEnabled
                        inventoryRef={ innerRef }
                        store={ store }
                        cmp={ component } />
                </Router>
            </Provider>
        </RBACProvider>
    );
};

AsyncInventory.propTypes = {
    store: PropTypes.object,
    onLoad: PropTypes.func,
    component: PropTypes.elementType.isRequired,
    history: PropTypes.object,
    innerRef: PropTypes.shape({
        current: PropTypes.any
    })
};

AsyncInventory.defaultProps = {
    onLoad: () => undefined
};

export default AsyncInventory;
