/* eslint-disable react/display-name */
import React from 'react';
import InventoryEntityTable from './EntityTable';
import { Grid, GridItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import './InventoryList.scss';
import AccessDenied from '../../Utilities/AccessDenied';

const InventoryList = React.forwardRef(
  ({ hasAccess, onRefreshData, ...props }, ref) => {
    if (ref) {
      ref.current = {
        onRefreshData: (params, disableRefresh = true, forceRefresh) => {
          onRefreshData(params, disableRefresh, forceRefresh);
        },
      };
    }

    return !hasAccess ? (
      <div className="ins-c-inventory__no-access">
        <AccessDenied showReturnButton={false} />
      </div>
    ) : (
      <Grid
        gutter="sm"
        className="ins-inventory-list"
        data-testid="inventory-table-list"
      >
        <GridItem span={12}>
          <InventoryEntityTable {...props} onRefreshData={onRefreshData} />
        </GridItem>
      </Grid>
    );
  }
);

InventoryList.propTypes = {
  showTags: PropTypes.bool,
  filterEntities: PropTypes.func,
  loadEntities: PropTypes.func,
  hasAccess: PropTypes.bool,
  page: PropTypes.number,
  perPage: PropTypes.number,
  sortBy: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.string,
  }),
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        account: PropTypes.any,
        isOpen: PropTypes.bool,
        title: PropTypes.node,
      }),
    ])
  ),
  entities: PropTypes.arrayOf(PropTypes.any),
  customFilters: PropTypes.shape({
    tags: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
  getEntities: PropTypes.func,
  hideFilters: PropTypes.shape({
    tags: PropTypes.bool,
    name: PropTypes.bool,
    registeredWith: PropTypes.bool,
    stale: PropTypes.bool,
    operatingSystem: PropTypes.bool,
  }),
  onRefreshData: PropTypes.func,
};

InventoryList.defaultProps = {
  hasAccess: false,
};

export default InventoryList;
