import { renderHook, waitFor } from '@testing-library/react';
import { useBootstrapInventoryTableDraft } from './useBootstrapInventoryTableDraft';
import {
  getInventoryTableDraftStorageKey,
  INVENTORY_TABLE_DRAFT_VERSION,
} from '../utils/inventoryTableDraftStorage';
import { INITIAL_INVENTORY_FILTERS } from '../inventoryFilterDefaults';

const ORG_ID = 'org-bootstrap-test';

describe('useBootstrapInventoryTableDraft', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hydrates search params from draft when url has no filter state', async () => {
    window.localStorage.setItem(
      getInventoryTableDraftStorageKey(ORG_ID),
      JSON.stringify({
        version: INVENTORY_TABLE_DRAFT_VERSION,
        filters: {
          ...INITIAL_INVENTORY_FILTERS,
          hostname_or_id: 'restored-host',
        },
      }),
    );

    const setSearchParams = jest.fn();
    const onReady = jest.fn();

    const { rerender } = renderHook(
      ({ searchParams }) =>
        useBootstrapInventoryTableDraft({
          orgId: ORG_ID,
          searchParams,
          setSearchParams,
          onReady,
        }),
      {
        initialProps: {
          searchParams: new URLSearchParams(),
        },
      },
    );

    await waitFor(() => {
      expect(setSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true },
      );
    });

    const hydratedParams = setSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(hydratedParams.get('hostname_or_id')).toBe('restored-host');

    rerender({ searchParams: hydratedParams });

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
    });
  });

  it('marks ready immediately when url already has filters', async () => {
    const onReady = jest.fn();

    renderHook(() =>
      useBootstrapInventoryTableDraft({
        orgId: ORG_ID,
        searchParams: new URLSearchParams('status=fresh'),
        setSearchParams: jest.fn(),
        onReady,
      }),
    );

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
    });
  });
});
