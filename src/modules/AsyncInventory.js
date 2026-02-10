import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';

import * as storeMod from '../store/redux';
import * as utils from '../Utilities/index';
import * as apiMod from '../api/index';
import RenderWrapper from '../Utilities/Wrapper';
const { mergeWithDetail, ...rest } = storeMod;

const queryClient = new QueryClient();

const AsyncInventory = ({ component, onLoad, store, innerRef, ...props }) => {
  useEffect(() => {
    onLoad?.({
      ...rest,
      ...utils,
      api: apiMod,
      mergeWithDetail,
    });
  }, []);

  const content = (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RenderWrapper
          {...props}
          isRbacEnabled
          inventoryRef={innerRef}
          store={store}
          cmp={component}
        />
      </QueryClientProvider>
    </Provider>
  );

  // Skipping RBACProvider caused InventoryTable not to load in other apps
  return (
    <RBACProvider appName="inventory" checkResourceDefinitions>
      {content}
    </RBACProvider>
  );
};

AsyncInventory.propTypes = {
  store: PropTypes.object,
  onLoad: PropTypes.func,
  component: PropTypes.elementType.isRequired,
  history: PropTypes.object,
  innerRef: PropTypes.shape({
    current: PropTypes.any,
  }),
  actionsConfig: PropTypes.shape({
    actions: PropTypes.arrayOf(PropTypes.object),
  }),
  activeFiltersConfig: PropTypes.shape({
    deleteTitle: PropTypes.string,
    filters: PropTypes.arrayOf(PropTypes.object),
    onDelete: PropTypes.func,
  }),
  autoRefresh: PropTypes.bool,
  axios: PropTypes.func,
  bulkSelect: PropTypes.shape({
    toggleProps: PropTypes.object,
    count: PropTypes.number,
    isDisabled: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.object),
    checked: PropTypes.bool,
  }),
  className: PropTypes.string,
  columns: PropTypes.func,
  customFilters: PropTypes.shape({
    advisorFilters: PropTypes.object,
  }),
  exportConfig: PropTypes.bool,
  getEntities: PropTypes.func,
  hasCheckbox: PropTypes.bool,
  hideFilters: PropTypes.shape({
    all: PropTypes.bool,
    name: PropTypes.bool,
    tags: PropTypes.bool,
    operatingSystem: PropTypes.bool,
    hostGroupFilter: PropTypes.bool,
  }),
  id: PropTypes.string,
  initialLoading: PropTypes.bool,
  showTags: PropTypes.bool,
  tableProps: PropTypes.shape({
    variant: PropTypes.string,
    canSelectAll: PropTypes.bool,
    isStickyHeader: PropTypes.bool,
    actionResolver: PropTypes.func,
    onSelect: PropTypes.func,
  }),
};

AsyncInventory.defaultProps = {
  onLoad: () => undefined,
};

export default AsyncInventory;
