import { renderHook, waitFor } from '@testing-library/react';
import { INITIAL_PAGE } from '../../InventoryViews/constants';
import { INITIAL_INVENTORY_FILTERS } from '../DataViewFiltersContext';
import { useResetPage } from './useResetPage';
import { jest, expect } from '@jest/globals';
import '@testing-library/jest-dom';

describe('useResetPage (SystemsView pagination reset on filter change)', () => {
  it('does not reset page on initial render', async () => {
    const setSearchParams = jest.fn();

    renderHook(() => useResetPage(INITIAL_INVENTORY_FILTERS, setSearchParams));

    await waitFor(() => {
      expect(setSearchParams).not.toHaveBeenCalled();
    });
  });

  it('resets page when filters change after initial render', async () => {
    const setSearchParams = jest.fn();

    const { rerender } = renderHook(
      ({ filters }) => useResetPage(filters, setSearchParams),
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
      expect(setSearchParams).toHaveBeenCalledTimes(1);
    });
    const params = setSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('page')).toBe(String(INITIAL_PAGE));
  });

  it('resets page when additionalSignature changes', async () => {
    const setSearchParams = jest.fn();

    const { rerender } = renderHook(
      ({ additionalSignature }) =>
        useResetPage(
          INITIAL_INVENTORY_FILTERS,
          setSearchParams,
          additionalSignature,
        ),
      {
        initialProps: {
          additionalSignature: null as { start?: string } | null,
        },
      },
    );

    rerender({ additionalSignature: { start: '2024-01-01' } });

    await waitFor(() => {
      expect(setSearchParams).toHaveBeenCalledTimes(1);
    });
    const params = setSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('page')).toBe(String(INITIAL_PAGE));
  });
});
