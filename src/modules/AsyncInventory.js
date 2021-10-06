import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import LoadingFallback from '../components/SpinnerFallback';

const AsyncInventory = ({ componentName, onLoad, store, history, innerRef, ...props }) => {
    const [Component, setComponent] = useState();
    useEffect(() => {
        (async () => {
          console.log('TESTING _______ wtf is AsyncInectory: ', componentName);
            const { inventoryConnector, mergeWithDetail, shared, api, ...rest } = await Promise.all([
                import(
                    /* webpackChunkName: "inventoryConnector" */
                    '../Utilities/inventoryConnector'
                ),
                import(/* webpackChunkName: "inventoryRedux" */ '../store/redux'),
                import(/* webpackChunkName: "inventoryShared" */ '../Utilities/index'),
                import(/* webpackChunkName: "inventoryApi" */ '../api/index')
            ]).then(([{ inventoryConnector }, { mergeWithDetail, ...rest }, shared, api]) => ({
                inventoryConnector,
                mergeWithDetail,
                shared,
                api,
                ...rest
            }));
            const { [componentName]: InvCmp } = inventoryConnector(store, undefined, undefined, true);
            onLoad({
                ...rest,
                ...shared,
                api,
                mergeWithDetail
            });
            setComponent(() => InvCmp);
        })();
    }, [componentName]);

    return (
        <Provider store={store}>
            <Router history={history}>
                {Component && <Component {...props} fallback={LoadingFallback} ref={innerRef} />}
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
