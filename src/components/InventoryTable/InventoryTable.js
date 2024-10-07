/* eslint-disable react/display-name */
import React, { Fragment, forwardRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import EntityTableToolbar from './EntityTableToolbar';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import InventoryList from './InventoryList';
import Pagination from './Pagination';
import AccessDenied from '../../Utilities/AccessDenied';
import { loadSystems } from '../../Utilities/sharedFunctions';
import { clearErrors, entitiesLoading } from '../../store/actions';
import { useSearchParams } from 'react-router-dom';
import { ACTION_TYPES } from '../../store/action-types';

/**
 * This component is used to combine all essential components together:
 *   * EntityTableToolbar - to control top toolbar.
 *   * InventoryList - to allow consumers to change data from outside and contains actual inventory table.
 *   * Pagination - bottom pagination.
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
      hasAccess = false,
      isFullView = false,
      getEntities,
      getTags,
      hideFilters,
      paginationProps,
      errorState = <ErrorState />,
      isLoaded,
      showTagModal,
      activeFiltersConfig,
      tableProps,
      showCentosVersions = false,
      enableExport,
      ...props
    },
    ref
  ) => {
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
    const sortBy = useSelector(
      ({ entities: { sortBy: invSortBy } }) =>
        hasItems ? propsSortBy : invSortBy,
      shallowEqual
    );

    const activeFilters = useSelector(
      ({ entities: { activeFilters } }) => activeFilters,
      shallowEqual
    );
    const loaded = useSelector(({ entities }) =>
      hasItems && isLoaded !== undefined
        ? isLoaded && entities?.loaded
        : entities?.loaded
    );

    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const hasLoadEntitiesError =
      error?.status === 404 &&
      error?.type === ACTION_TYPES.LOAD_ENTITIES &&
      parseInt(searchParams.get('page')) !== 1;

    const params = useMemo(() => {
      return {
        items,
        sortBy,
        hideFilters,
        filters: activeFilters,
        hasItems,
        activeFiltersConfig,
        ...customFilters,
        globalFilter: customFilters?.globalFilter || {
          tags: [],
          filter: { system_profile: { host_type: 'nil' } },
        },
      };
    }, [
      items,
      sortBy,
      hideFilters,
      activeFilters,
      hasItems,
      activeFiltersConfig,
      customFilters,
    ]);

    /**
     * If consumer wants to change data they can call this function via component ref.
     * @param {*} options new options to be applied, like pagination, filters, etc.
     */
    const onRefreshData = (options = {}, disableOnRefresh) => {
      const currPerPage = options?.per_page || options?.perPage || perPage;

      const mergedParams = {
        ...params,
        page: options?.page,
        per_page: currPerPage,
      };

      if (hasAccess) {
        if (onRefresh && !disableOnRefresh) {
          onRefresh(mergedParams, (options) => {
            dispatch(
              loadSystems(
                { ...mergedParams, ...options },
                showTags,
                getEntities
              )
            );
          });
        } else {
          dispatch(loadSystems(mergedParams, showTags, getEntities));
        }
      }
    };

    const debouncedRefresh = debounce((config) => onRefreshData(config), 800);

    useEffect(() => {
      if (error) {
        if (hasLoadEntitiesError) {
          debouncedRefresh({ page: 1 });
          dispatch(clearErrors());
        }
      }
    }, [error]);

    useEffect(() => {
      dispatch(entitiesLoading());
      debouncedRefresh();
    }, [JSON.stringify(params)]);

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
          onRefreshData={debouncedRefresh}
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
          onRefreshData={debouncedRefresh}
          loaded={loaded}
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
            onRefreshData={debouncedRefresh}
            paginationProps={paginationProps}
            loaded={loaded}
          />
        </TableToolbar>
      </Fragment>
    ) : (
      errorState
    );
  }
);

InventoryTable.propTypes = {
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
  showTagModal: PropTypes.bool,
  activeFiltersConfig: PropTypes.object,
  tableProps: PropTypes.object,
  showCentosVersions: PropTypes.bool,
  showNoGroupOption: PropTypes.bool, // group filter option
  enableExport: PropTypes.bool,
};

export default InventoryTable;
