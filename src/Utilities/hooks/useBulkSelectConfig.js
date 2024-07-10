/* eslint-disable camelcase */
import { Spinner } from '@patternfly/react-core';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import React, { Fragment, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/actions';
import { loadSystems } from '../sharedFunctions';
import useFetchBatched from './useFetchBatched';

export const useBulkSelectConfig = (
  selected,
  globalFilter,
  total,
  rows,
  loaded,
  pageSelected,
  groupName
) => {
  const [isBulkLoading, setBulkLoading] = useState(false);
  const { fetchBatched } = useFetchBatched();
  const dispatch = useDispatch();
  const onSelectRows = (id, isSelected) =>
    dispatch(actions.selectEntity(id, isSelected));
  const calculateSelected = () => (selected ? selected.size : 0);
  const { activeFilters } = useSelector(({ entities }) => entities);
  const noneSelected = selected ? selected.size === 0 : true;

  const getEntitiesWrapper = async (filters, { page, per_page }) => {
    const resp = loadSystems({ page, per_page, ...filters });

    const data = await resp.payload;
    return data;
  };

  const calculateChecked = (rows = [], selected) =>
    rows.every(({ id }) => selected && selected.has(id))
      ? rows.length > 0
      : rows.some(({ id }) => selected && selected.has(id)) && null;

  const fetchAllSystemIds = useCallback((filters, total) => {
    return fetchBatched(getEntitiesWrapper, total, filters);
  }, []);

  const selectAllIds = async (selected = true) => {
    setBulkLoading(true);
    const data = await fetchAllSystemIds(
      {
        filters: groupName
          ? [...activeFilters, { hostGroupFilter: groupName }]
          : activeFilters,
        globalFilter: globalFilter ?? {},
      },
      total
    );
    const results = flatten(map(data, 'results'));
    dispatch(actions.selectEntity(results, selected));
    setBulkLoading(false);
  };

  return {
    id: 'bulk-select-systems',
    count: selected ? selected.size : 0,
    items: [
      {
        title: 'Select none (0 items)',
        onClick: () => onSelectRows(-1, false),
        props: { isDisabled: noneSelected },
      },
      {
        ...(loaded && rows && rows.length > 0
          ? {
              title: `${pageSelected ? 'Deselect' : 'Select'} page (${
                rows.length
              } ${rows.length === 1 ? 'item' : 'items'})`,
              onClick: () => onSelectRows(0, !pageSelected),
            }
          : {}),
      },
      {
        ...(loaded && rows && rows.length > 0
          ? {
              title: `Select all (${total} ${total === 1 ? 'item' : 'items'})`,
              onClick: async () => {
                await selectAllIds();
              },
            }
          : {}),
      },
    ],
    checked: calculateChecked(rows, selected),
    onSelect: (value) => {
      onSelectRows(0, value);
    },
    ...(isBulkLoading
      ? {
          isDisabled: isBulkLoading,
          toggleProps: {
            children: [
              <Fragment key="sd">
                <Spinner size="md" />
                &nbsp;
                <span id="bulk-select-systems-toggle-checkbox-text">{`${calculateSelected()} selected`}</span>
              </Fragment>,
            ],
          },
        }
      : {}),
  };
};
