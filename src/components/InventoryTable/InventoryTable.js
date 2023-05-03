/* eslint-disable camelcase */
import React, { Fragment, forwardRef, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, shallowEqual, useStore, useDispatch } from 'react-redux';
import EntityTableToolbar from './EntityTableToolbar';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import InventoryList from './InventoryList';
import Pagination from './Pagination';
import AccessDenied from '../../Utilities/AccessDenied';
import { loadSystems } from '../../Utilities/sharedFunctions';
import isEqual from 'lodash/isEqual';
import { entitiesLoading } from '../../store/actions';
import cloneDeep from 'lodash/cloneDeep';

/**
 * A helper function to store props and to always return the latest state.
 * For example, EntityTableToolbar wraps OnRefreshData in a callback, so we need this
 * to get the latest props and not the props at the time of when the function is
 * being wrapped in callback.
 */
const inventoryCache = () => {
    let cache = {};

    const updateProps = (props) => { cache = cloneDeep({ ...cache, props }); };

    const updateParams = (params) => { cache = cloneDeep({ ...cache, params }); };

    const getProps = () => cache.props;
    const getParams = () => cache.params;

    return { updateProps, updateParams, getProps, getParams };
};

/**
 * This component is used to combine all essential components together:
 *   * EntityTableToolbar - to control top toolbar.
 *   * InventoryList - to allow consumers to change data from outside and contains actual inventory table.
 *   * Pagination - bottom pagination.
 * It also calculates pagination and sortBy from props or from store if consumer passed items or not.
 */

const InventoryTable = forwardRef(({ // eslint-disable-line react/display-name
    onRefresh,
    children,
    inventoryRef,
    items,
    total: propsTotal,
    page: propsPage,
    perPage: propsPerPage,
    showTags,
    sortBy: propsSortBy,
    customFilters,
    hasAccess = true,
    isFullView = false,
    getEntities,
    getTags,
    hideFilters,
    paginationProps,
    errorState = <ErrorState />,
    autoRefresh,
    isLoaded,
    initialLoading,
    ignoreRefresh,
    showTagModal,
    activeFiltersConfig,
    tableProps,
    isRbacEnabled,
    hasCheckbox,
    onRowClick,
    ...props
}, ref) => {
    const hasItems = Boolean(items);
    const error = useSelector(({ entities }) => (
        entities?.error
    ));
    const page = useSelector(({ entities: { page: invPage } }) => (
        hasItems ? propsPage : (invPage || 1)
    ), shallowEqual);
    const perPage = useSelector(({ entities: { perPage: invPerPage } }) => (
        hasItems ? propsPerPage : (invPerPage || 50)
    ), shallowEqual);
    const total = useSelector(({ entities: { total: invTotal } }) => {
        if (hasItems) {
            return propsTotal !== undefined ? propsTotal : items?.length;
        }

        return invTotal;
    }, shallowEqual);
    const pagination = {
        page,
        perPage,
        total
    };
    const sortBy = useSelector(({ entities: { sortBy: invSortBy } }) => (
        hasItems ? propsSortBy : invSortBy
    ), shallowEqual);

    const reduxLoaded = useSelector(({ entities }) => (
        hasItems && isLoaded !== undefined ? (isLoaded && entities?.loaded) : entities?.loaded
    ));

    /**
     * If initialLoading is set to true, then the component should be in loading state until
     * entities.loaded is false (and then we can use the redux loading state and forget this one)
     */
    const [initialLoadingActive, disableInitialLoading] = useState(initialLoading);
    useEffect(() => {
        if (!reduxLoaded) {
            disableInitialLoading();
        }
    }, [reduxLoaded]);
    const loaded = reduxLoaded && !initialLoadingActive;

    const dispatch = useDispatch();
    const store = useStore();

    const cache = useRef(inventoryCache());
    cache.current.updateProps({
        page,
        perPage,
        items,
        sortBy,
        hideFilters,
        showTags,
        getEntities,
        customFilters,
        hasItems,
        activeFiltersConfig
    });

    /**
     * If consumer wants to change data they can call this function via component ref.
     * @param {*} options new options to be applied, like pagination, filters, etc.
     */
    const onRefreshData = (options = {}, disableOnRefresh, forceRefresh = false) => {
        const { activeFilters } = store.getState().entities;
        const cachedProps = cache.current?.getProps() || {};
        const currPerPage = options?.per_page || options?.perPage || cachedProps.perPage;

        const newParams = {
            page: cachedProps.page,
            per_page: currPerPage,
            items: cachedProps.items,
            sortBy: cachedProps.sortBy,
            hideFilters: cachedProps.hideFilters,
            filters: activeFilters,
            hasItems: cachedProps.hasItems,
            //RHIF-246: Compliance app depends on activeFiltersConfig to apply its filters.
            activeFiltersConfig: cachedProps.activeFiltersConfig,
            ...customFilters,
            ...options
        };

        const cachedParams = cache.current.getParams();
        if (!isEqual(cachedParams, newParams) || forceRefresh) {
            cache.current.updateParams(newParams);
            if (onRefresh && !disableOnRefresh) {
                dispatch(entitiesLoading());
                onRefresh(newParams, (options) => {
                    dispatch(
                        loadSystems(
                            { ...newParams, ...options },
                            cachedProps.showTags,
                            cachedProps.getEntities
                        )
                    );
                });
            } else {
                dispatch(
                    loadSystems(
                        newParams,
                        cachedProps.showTags,
                        cachedProps.getEntities
                    )
                );
            }
        }
    };

    const prevFilters = useRef(customFilters);
    useEffect(() => {
        if (autoRefresh && !isEqual(prevFilters.current, customFilters)) {
            onRefreshData({ page: 1 });
            prevFilters.current = customFilters;
        }
    });

    return (
        (hasAccess === false && isFullView) ?
            <AccessDenied
                title="This application requires Inventory permissions"
                description={<div>
                    To view the content of this page, you must be granted
                    a minimum of inventory permissions from your Organization Administrator.
                </div>}
            /> :
            !error ? <Fragment>
                <EntityTableToolbar
                    { ...props }
                    customFilters={customFilters}
                    hasAccess={hasAccess}
                    items={ items }
                    hasItems={ hasItems }
                    total={ pagination.total }
                    page={ pagination.page }
                    perPage={ pagination.perPage }
                    showTags={ showTags }
                    getTags={ getTags }
                    onRefreshData={onRefreshData}
                    sortBy={ sortBy }
                    hideFilters={hideFilters}
                    paginationProps={paginationProps}
                    loaded={loaded}
                    showTagModal={showTagModal}
                    activeFiltersConfig={{ deleteTitle: 'Reset filters', ...activeFiltersConfig }}
                >
                    { children }
                </EntityTableToolbar>
                <InventoryList
                    { ...props }
                    hasCheckbox={hasCheckbox}
                    onRowClick={onRowClick}
                    tableProps={tableProps}
                    customFilters={customFilters}
                    hasAccess={hasAccess}
                    ref={ref}
                    hasItems={ hasItems }
                    items={ items }
                    page={ pagination.page }
                    sortBy={ sortBy }
                    perPage={ pagination.perPage }
                    showTags={ showTags }
                    onRefreshData={onRefreshData}
                    loaded={loaded}
                    ignoreRefresh={ignoreRefresh}
                />
                <TableToolbar isFooter className="ins-c-inventory__table--toolbar">
                    <Pagination
                        hasAccess={hasAccess}
                        isFull
                        total={ pagination.total }
                        page={ pagination.page }
                        perPage={ pagination.perPage }
                        hasItems={ hasItems }
                        onRefreshData={onRefreshData}
                        paginationProps={paginationProps}
                        loaded={loaded}
                    />
                </TableToolbar>
            </Fragment> : errorState
    );
});

InventoryTable.propTypes = {
    autoRefresh: PropTypes.bool,
    onRefresh: PropTypes.func,
    children: PropTypes.node,
    inventoryRef: PropTypes.object,
    items: PropTypes.array,
    total: PropTypes.number,
    page: PropTypes.number,
    perPage: PropTypes.number,
    showTags: PropTypes.bool,
    getTags: PropTypes.func,
    sortBy: PropTypes.object,
    customFilters: PropTypes.any,
    hasAccess: PropTypes.bool,
    isFullView: PropTypes.bool,
    getEntities: PropTypes.func,
    hideFilters: PropTypes.object,
    paginationProps: PropTypes.object,
    errorState: PropTypes.node,
    isLoaded: PropTypes.bool,
    initialLoading: PropTypes.bool,
    ignoreRefresh: PropTypes.bool,
    showTagModal: PropTypes.bool,
    activeFiltersConfig: PropTypes.object,
    tableProps: PropTypes.object,
    isRbacEnabled: PropTypes.bool,
    hasCheckbox: PropTypes.bool,
    onRowClick: PropTypes.func
};

export default InventoryTable;
