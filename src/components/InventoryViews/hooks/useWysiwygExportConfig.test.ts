import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { SystemsViewExportState } from '../../SystemsView/export/types';
import type { SystemsViewItem } from '../../SystemsView/types';

jest.mock('../../../services/exportService/useInventoryExportRequest', () => ({
  useInventoryExportRequest: () => requestExport,
}));

const requestExport = jest.fn<(...args: unknown[]) => Promise<void>>(
  async () => {},
);

// @swc/jest does not hoist jest.mock above compiled requires (unlike
// babel-jest), so the module under test must be required AFTER the mock
// registrations above.
const { useWysiwygExportConfig } =
  require('./useWysiwygExportConfig') as typeof import('./useWysiwygExportConfig');

const exportState = {
  filters: { hostname_or_id: 'web-01' },
  lastSeenCustomRange: null,
  columns: [
    { key: 'display_name', isShown: true },
    {
      key: 'advisor:recommendations',
      isShown: true,
      isPermissionLocked: true,
    },
    { key: 'operating_system', isShown: false },
  ],
  sortBy: 'status',
  direction: 'asc',
  selectedItems: [],
  total: 5,
} as unknown as SystemsViewExportState<SystemsViewItem>;

describe('useWysiwygExportConfig', () => {
  beforeEach(() => {
    requestExport.mockClear();
  });

  it('exports the current view: configuration envelope with live state serialized', async () => {
    const { result } = renderHook(() => useWysiwygExportConfig());

    expect(result.current.onExport).toBeDefined();
    await result.current.onExport?.('csv', exportState);

    expect(requestExport).toHaveBeenCalledWith('csv', {
      configuration: {
        // Permission-locked and hidden columns are stripped; the Status
        // sort key is mapped to the backend's last_check_in.
        columns: [{ key: 'display_name' }],
        sort: { key: 'last_check_in', direction: 'asc' },
        filters: { host: { hostname_or_id: 'web-01' } },
      },
    });
  });

  it('disables the export when no rows match the current filters', () => {
    const { result } = renderHook(() => useWysiwygExportConfig());

    const { isDisabled } = result.current;
    expect(isDisabled).toBeInstanceOf(Function);
    const isDisabledFn = isDisabled as (
      state: SystemsViewExportState<SystemsViewItem>,
    ) => boolean;

    expect(isDisabledFn({ ...exportState, total: 0 })).toBe(true);
    expect(isDisabledFn(exportState)).toBe(false);
  });
});
