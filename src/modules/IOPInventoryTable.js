import React from 'react';
import AsyncInventory from './AsyncInventory';
import PropTypes from 'prop-types';
import { InventoryTable as InventoryTableCmp } from '../components/InventoryTable';

const BaseIOPInventoryTable = (props) => {
  return <AsyncInventory {...props} component={InventoryTableCmp} />;
};
const IOPInventoryTable = React.forwardRef((props, ref) => (
  <BaseIOPInventoryTable {...props} innerRef={ref} />
));

BaseIOPInventoryTable.propTypes = {
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
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  onLoad: PropTypes.func,
  showTags: PropTypes.bool,
  store: PropTypes.shape({
    dispatch: PropTypes.func,
    subscribe: PropTypes.func,
    getState: PropTypes.func,
    replaceReducer: PropTypes.func,
  }),
  tableProps: PropTypes.shape({
    variant: PropTypes.string,
    canSelectAll: PropTypes.bool,
    isStickyHeader: PropTypes.bool,
    actionResolver: PropTypes.func,
    onSelect: PropTypes.func,
  }),
};

export default IOPInventoryTable;

export { useOperatingSystemFilter } from '../components/filters/useOperatingSystemFilter';
