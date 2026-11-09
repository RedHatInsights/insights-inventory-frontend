import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { expect, jest } from '@jest/globals';
import type { SystemsViewExportConfig } from '../components/SystemsView/export/types';
import type { SystemsViewItem } from '../components/SystemsView/types';

jest.mock('../Utilities/hooks/useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => false,
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  AccessCheck: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

jest.mock('@redhat-cloud-services/frontend-components/RBACProvider', () => ({
  RBACProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// The platform axios interceptors resolve with response.data (NOT the axios
// response) — the mocks mirror that contract.
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => mockAxios,
  }),
);

jest.mock('../services/exportService/helpers', () => ({
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

interface CapturedProps {
  exportConfig?: SystemsViewExportConfig<SystemsViewItem>;
}

const capturedProps: CapturedProps[] = [];

jest.mock('../components/SystemsView/SystemsView', () => ({
  SystemsView: (props: CapturedProps) => {
    capturedProps.push(props);
    return <div data-testid="systems-view-stub" />;
  },
}));

// @swc/jest does not hoist jest.mock above compiled requires (unlike
// babel-jest), so the module under test must be required AFTER the mock
// registrations above.
const SystemsViewModule = require('./SystemsView') as {
  default: React.ComponentType<Record<string, unknown>>;
};

const lastCapturedProps = () => capturedProps.at(-1);

const renderWrapper = (props: Record<string, unknown> = {}) =>
  render(
    <SystemsViewModule.default
      queryKeyPrefix="wrapper-test"
      fetchData={jest.fn()}
      columns={jest.fn()}
      filters={jest.fn()}
      {...props}
    />,
  );

describe('modules/SystemsView (federated wrapper)', () => {
  beforeEach(() => {
    capturedProps.length = 0;
    mockAxios.post.mockReset();
    mockAxios.get.mockReset();
    mockAxios.post.mockResolvedValue({ id: 'export-1' });
    mockAxios.get.mockResolvedValue({ status: 'complete' });
  });

  it('hides the export menu when no exportConfig is provided', () => {
    renderWrapper();

    expect(screen.getByTestId('systems-view-stub')).toBeInTheDocument();
    expect(lastCapturedProps()?.exportConfig).toBeUndefined();
  });

  it('resolves an omitted onExport to the inventory all-systems export with legacy labels', () => {
    renderWrapper({ exportConfig: {} });

    const exportConfig = lastCapturedProps()?.exportConfig;
    expect(exportConfig?.onExport).toBeInstanceOf(Function);
    expect(exportConfig?.itemTexts).toEqual({
      csv: 'Export all systems to CSV',
      json: 'Export all systems to JSON',
    });
  });

  it('keeps a custom onExport and the generic default labels', () => {
    const onExport = jest.fn(async () => {});
    renderWrapper({ exportConfig: { onExport } });

    const exportConfig = lastCapturedProps()?.exportConfig;
    expect(exportConfig?.onExport).toBe(onExport);
    expect(exportConfig?.itemTexts).toBeUndefined();
  });

  it('the resolved fallback exports all systems with empty filters', async () => {
    renderWrapper({ exportConfig: {} });

    const exportConfig = lastCapturedProps()?.exportConfig;
    await exportConfig?.onExport?.('csv', {} as never);

    expect(mockAxios.post).toHaveBeenCalledWith('/api/export/v1/exports', {
      name: 'inventory-export',
      format: 'csv',
      sources: [{ application: 'app', resource: 'res', filters: {} }],
    });
  });
});
