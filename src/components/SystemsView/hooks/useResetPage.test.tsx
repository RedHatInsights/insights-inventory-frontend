import { renderHook, waitFor } from '@testing-library/react';
import { useDataViewPagination } from '@patternfly/react-data-view';
import { INITIAL_PAGE } from '../../InventoryViews/constants';
import { INITIAL_INVENTORY_FILTERS } from '../DataViewFiltersContext';
import { useResetPage } from './useResetPage';
import { jest, expect } from '@jest/globals';
import '@testing-library/jest-dom';

type DataViewPagination = ReturnType<typeof useDataViewPagination>;

const paginationStub = (onSetPage: jest.Mock): DataViewPagination =>
  ({ onSetPage }) as unknown as DataViewPagination;

describe('useResetPage (SystemsView pagination reset on filter change)', () => {
  it('does not reset page on initial render', async () => {
    const onSetPage = jest.fn();

    renderHook(() =>
      useResetPage(INITIAL_INVENTORY_FILTERS, paginationStub(onSetPage)),
    );

    await waitFor(() => {
      expect(onSetPage).not.toHaveBeenCalled();
    });
  });

  it('resets page when filters change after initial render', async () => {
    const onSetPage = jest.fn();

    const { rerender } = renderHook(
      ({ filters }) => useResetPage(filters, paginationStub(onSetPage)),
      {
        initialProps: {
          filters: INITIAL_INVENTORY_FILTERS,
        },
      },
    );

    rerender({
      filters: { ...INITIAL_INVENTORY_FILTERS, status: ['fresh'] },
    });

    await waitFor(() => {
      expect(onSetPage).toHaveBeenCalledTimes(1);
    });
    expect(onSetPage).toHaveBeenCalledWith(undefined, INITIAL_PAGE);
  });
});
