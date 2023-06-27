/* eslint-disable camelcase */
import { Spinner } from '@patternfly/react-core';
import { flatten, map } from 'lodash';
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
  loaded
) => {
  const [isBulkLoading, setBulkLoading] = useState(false);
  const { fetchBatched } = useFetchBatched();
  const dispatch = useDispatch();
  const onSelectRows = (id, isSelected) =>
    dispatch(actions.selectEntity(id, isSelected));
  const calculateSelected = () => (selected ? selected.size : 0);
  const { activeFilters } = useSelector(({ entities }) => entities);

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
      { filters: activeFilters, globalFilter },
      total
    );
    const results = flatten(map(data, 'results'));
    dispatch(actions.selectEntity(results, selected));
    setBulkLoading(false);
  };

  return {
    id: 'bulk-select-systems',
    items: [
      {
        title: 'Select none (0)',
        onClick: () => {
          onSelectRows(-1, false);
        },
        props: { isDisabled: !selected },
      },
      {
        ...(loaded && rows && rows.length > 0
          ? {
              title: `Select page (${rows.length})`,
              onClick: () => {
                onSelectRows(0, true);
              },
            }
          : {}),
      },
      {
        ...(loaded && rows && rows.length > 0
          ? {
              title: `Select all (${total})`,
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
    toggleProps: {
      'data-ouia-component-type': 'bulk-select-toggle-button',
      children: isBulkLoading
        ? [
            <Fragment key="sd">
              <Spinner size="sm" />
              {`${calculateSelected()} selected`}
            </Fragment>,
          ]
        : `${calculateSelected()} selected`,
    },
  };
};
