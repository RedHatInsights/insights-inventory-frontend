import { renderHook } from '@testing-library/react';
import { expect, jest } from '@jest/globals';
import type { SystemsViewExportState } from '../../components/SystemsView/export/types';
import type { SystemsViewItem } from '../../components/SystemsView/types';

// The platform axios interceptors resolve with response.data (NOT the axios
// response) — the mocks mirror that contract.
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => mockAxios,
  }),
);

jest.mock('./helpers', () => ({
  buildExportRequestJson: (filters: unknown, format: unknown) => ({
    name: 'inventory-export',
    format,
    sources: [{ application: 'app', resource: 'res', filters }],
  }),
  downloadFile: jest.fn(async () => {}),
}));

const mockAxios = {
  post: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  get: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
};

// @swc/jest does not hoist jest.mock above compiled requires (unlike
// babel-jest), so the module under test must be required AFTER the mock
// registrations above.
const { useAllSystemsExportConfig } =
  require('./useAllSystemsExportConfig') as typeof import('./useAllSystemsExportConfig');

const exportState = {} as SystemsViewExportState<SystemsViewItem>;

describe('useAllSystemsExportConfig', () => {
  beforeEach(() => {
    mockAxios.post.mockReset();
    mockAxios.get.mockReset();
    mockAxios.post.mockResolvedValue({ id: 'export-1' });
    mockAxios.get.mockResolvedValue({ status: 'complete' });
  });

  it('uses the legacy all-systems labels', () => {
    const { result } = renderHook(() => useAllSystemsExportConfig());

    expect(result.current.itemTexts).toEqual({
      csv: 'Export all systems to CSV',
      json: 'Export all systems to JSON',
    });
  });

  it('exports all systems: empty filters, table state ignored', async () => {
    const { result } = renderHook(() => useAllSystemsExportConfig());
    expect(result.current.onExport).toBeDefined();
    await result.current.onExport?.('csv', exportState);

    expect(mockAxios.post).toHaveBeenCalledWith('/api/export/v1/exports', {
      name: 'inventory-export',
      format: 'csv',
      sources: [{ application: 'app', resource: 'res', filters: {} }],
    });
  });
});
