/* eslint-disable react/display-name */
/* eslint-disable camelcase */
import React, {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector, useStore } from 'react-redux';
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
import { useSearchParams } from 'react-router-dom';
import { ACTION_TYPES } from '../../store/action-types';
import { debounce } from 'lodash';

/**
 * A helper function to store props and to always return the latest state.
 * For example, EntityTableToolbar wraps OnRefreshData in a callback, so we need this
 * to get the latest props and not the props at the time of when the function is
 * being wrapped in callback.
 */
export const inventoryCache = () => {
  let cache = {};

  const updateProps = (props) => {
    cache = cloneDeep({ ...cache, props });
  };

  const updateParams = (params) => {
    cache = cloneDeep({ ...cache, params });
  };

  const getProps = () => cache.props;
  const getParams = () => cache.params;

  return { updateProps, updateParams, getProps, getParams };
};

/**
 * This component is used to combine all essential components together:
 * EntityTableToolbar - to control top toolbar.
 * InventoryList - to allow consumers to change data from outside and contains actual inventory table.
 * Pagination - bottom pagination.
 * It also calculates pagination and sortBy from props or from store if consumer passed items or not.
 */

const InventoryTable = forwardRef(
  (
    {
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
      hasCheckbox,
      showCentosVersions = false,
      enableExport,
      ...props
    },
    ref
  ) => {
    console.log('INVENTORY TABLE PROPSS on god', props, activeFiltersConfig);
    const hasItems = Boolean(items);
    const error = useSelector(({ entities }) => entities?.error);
    const page = useSelector(
      ({ entities: { page: invPage } }) =>
        hasItems ? propsPage : invPage || 1,
      shallowEqual
    );
    const perPage = useSelector(
      ({ entities: { perPage: invPerPage } }) =>
        hasItems ? propsPerPage : invPerPage || 50,
      shallowEqual
    );
    const total = useSelector(({ entities: { total: invTotal } }) => {
      if (hasItems) {
        return propsTotal !== undefined ? propsTotal : items?.length;
      }

      return invTotal;
    }, shallowEqual);
    const pagination = {
      page,
      perPage,
      total,
    };

    const sortBy = useSelector(({ entities: { sortBy: invSortBy } }) => {
      const propsSortByOrFallback =
        propsSortBy?.key != null ? propsSortBy : invSortBy;
      const invSortByOrFallback =
        invSortBy?.key != null ? invSortBy : propsSortBy;
      // console.log(
      //   'sortBy Inside',
      //   propsSortByOrFallback,
      //   invSortByOrFallback,
      //   hasItems ? propsSortByOrFallback : invSortByOrFallback
      // );
      return hasItems ? propsSortByOrFallback : invSortByOrFallback;
    }, shallowEqual);

    const loaded = useSelector(({ entities }) =>
      hasItems && isLoaded !== undefined
        ? isLoaded && entities?.loaded
        : entities?.loaded
    );

    const [searchParams] = useSearchParams();

    const dispatch = useDispatch();
    const store = useStore();
    const { activeFilters } = store.getState().entities;

    const hasLoadEntitiesError =
      error?.status === 404 &&
      error?.type === ACTION_TYPES.LOAD_ENTITIES &&
      parseInt(searchParams.get('page')) !== 1;

    /**
     * If consumer wants to change data they can call this function via component ref.
     *  @param {*} options          new options to be applied, like pagination, filters, etc.
     *  @param     disableOnRefresh
     */
    const onRefreshData = (options = {}, disableOnRefresh) => {
      console.log('xddd', { options, activeFiltersConfig, sortBy });

      const newParams = {
        page: options?.page || page,
        per_page: options?.per_page || perPage,
        items: items,
        sortBy: options?.sortBy || sortBy,
        hideFilters: options?.hideFilters || hideFilters,
        filters: options?.activeFilters,
        hasItems: options.hasItems,
        //RHIF-246: Compliance app depends on activeFiltersConfig to apply its filters.
        activeFiltersConfig: options?.activeFiltersConfig,
        ...options?.customFilters,
        ...options,
        globalFilter: customFilters?.globalFilter,
      };

      //Check for the rbac permissions
      if (hasAccess) {
        // cache.current.updateParams(newParams);
        if (onRefresh && !disableOnRefresh) {
          dispatch(entitiesLoading());
          onRefresh(newParams, (options) => {
            let obj = {
              ...newParams,
              ...options,
            };
            console.log('onrefresh fr fr', obj);
            dispatch(loadSystems(obj, showTags, getEntities));
          });
        } else {
          console.log('onrefresh else fr fr', newParams);
          dispatch(loadSystems(newParams, showTags, getEntities));
        }
      }
    };

    const debouncedOnRefreshDataa = (...args) => onRefreshData(...args);

    // const debouncedOnRefreshDataa = useCallback(
    //   debounce((...args) => {
    //     return onRefreshData(...args);
    //   }, 800),
    //   [onRefreshData]
    // );

    // useEffect(() => {
    //   return () => {
    //     debouncedOnRefreshDataa.cancel();
    //   };
    // }, [debouncedOnRefreshDataa]);

    const buildOptions = (...args) => {
      const [arg0, ...rest] = args;
      const options = {
        ...arg0,
        activeFiltersConfig,
        activeFilters,
        customFilters,
        hasItems,
      };
      return [options, ...rest];
    };

    const wrappedOnRefreshData = (...args) => {
      onRefreshData(...buildOptions(...args));
    };

    const debouncedOnRefreshData = (...args) => {
      debouncedOnRefreshDataa(...buildOptions(...args));
    };

    // const firstMount = useRef(true);

    const onSort = ({ index, key, direction }) => {
      wrappedOnRefreshData({
        sortBy: {
          index,
          key,
          direction,
        },
      });
    };

    const prevFilters = useRef(null);
    useEffect(() => {
      console.log({
        autoRefresh,
        prevFilters: prevFilters?.current,
        customFilters,
      });
      console.log('useeffect customfilters', { prevFilters, customFilters });
      debugger;
      if (
        ((customFilters.hasOwnProperty('globalFilter') &&
          customFilters?.globalFilter !== undefined) ||
          !customFilters.hasOwnProperty('globalFilter')) &&
        !isEqual(prevFilters.current, customFilters)
      ) {
        // if (!isEqual(prevFilters.current?.filters, customFilters?.filters)) {
        debugger;
        console.log(
          'onrefresh not equal',
          prevFilters.current?.filters,
          customFilters?.filters
        );
        // if (
        //   Array.isArray(prevFilters.current?.filters) &&
        //   prevFilters.current.filters?.length === 0
        // ) {
        // firstMount.current = false;
        prevFilters.current = customFilters;
        debouncedOnRefreshData();
        // }
        // prevFilters.current = customFilters;
      }
    }, [customFilters]);

    // useEffect(() => {
    //   // console.log({
    //   //   autoRefresh,
    //   //   prevFilters: prevFilters?.current,
    //   //   customFilters,
    //   // });
    //   // console.log('useeffect init customfilters', {
    //   //   prevFilters,
    //   //   customFilters,
    //   // });
    //   // customFilters should be truly custom ig
    //   // if (!isEqual(prevFilters.current, customFilters)) {
    //   // console.log(
    //   //   'onrefresh not equal',
    //   //   prevFilters.current?.filters,
    //   //   customFilters?.filters
    //   // );
    //   // if (
    //   //   Array.isArray(prevFilters.current?.filters) &&
    //   //   prevFilters.current.filters?.length === 0
    //   // ) {
    //   debouncedOnRefreshData();
    //   firstMount.current = false;
    //   // }
    //   // prevFilters.current = customFilters;
    //   // }
    // }, []);

    const onRefreshDataCallbacks = {
      defaultOnRefreshData: wrappedOnRefreshData,
      debouncedOnRefreshData: debouncedOnRefreshData,
    };

    return hasAccess === false && isFullView ? (
      <AccessDenied
        title="This application requires Inventory permissions"
        description={
          <div>
            To view the content of this page, you must be granted a minimum of
            inventory permissions from your Organization Administrator.
          </div>
        }
      />
    ) : !error || hasLoadEntitiesError ? (
      <Fragment>
        <EntityTableToolbar
          {...props}
          data-testid="inventory-table-top-toolbar"
          customFilters={customFilters}
          hasAccess={hasAccess}
          items={items}
          hasItems={hasItems}
          total={pagination.total}
          page={pagination.page}
          perPage={pagination.perPage}
          showTags={showTags}
          getTags={getTags}
          onRefreshData={onRefreshDataCallbacks}
          sortBy={sortBy}
          hideFilters={hideFilters}
          paginationProps={paginationProps}
          loaded={loaded}
          showTagModal={showTagModal}
          activeFiltersConfig={{
            deleteTitle: 'Reset filters',
            ...activeFiltersConfig,
          }}
          showCentosVersions={showCentosVersions}
          enableExport={enableExport}
        >
          {children}
        </EntityTableToolbar>
        <InventoryList
          {...props}
          hasCheckbox={hasCheckbox}
          tableProps={tableProps}
          customFilters={customFilters}
          hasAccess={hasAccess}
          ref={ref}
          hasItems={hasItems}
          items={items}
          page={pagination.page}
          sortBy={sortBy}
          perPage={pagination.perPage}
          showTags={showTags}
          onRefreshData={debouncedOnRefreshData}
          loaded={loaded}
          ignoreRefresh={ignoreRefresh}
          onSort={onSort}
        />
        <TableToolbar
          isFooter
          className="ins-c-inventory__table--toolbar"
          data-testid="inventory-table-bottom-toolbar"
        >
          <Pagination
            hasAccess={hasAccess}
            isFull
            total={pagination.total}
            page={pagination.page}
            perPage={pagination.perPage}
            hasItems={hasItems}
            onRefreshData={wrappedOnRefreshData}
            paginationProps={paginationProps}
            loaded={loaded}
            ouiaId={'bottom-pagination'}
          />
        </TableToolbar>
      </Fragment>
    ) : (
      errorState
    );
  }
);

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
  hasCheckbox: PropTypes.bool,
  showCentosVersions: PropTypes.bool,
  showNoGroupOption: PropTypes.bool, // group filter option
  enableExport: PropTypes.bool,
};

export default InventoryTable;
