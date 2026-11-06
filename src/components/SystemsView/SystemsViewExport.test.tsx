import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, jest } from '@jest/globals';
import type {
  ExportFormat,
  SystemsViewExportConfig,
  SystemsViewExportState,
} from './export/types';
import type { SystemsViewItem } from './types';

const mockAddNotification = jest.fn();
const mockRemoveNotification = jest.fn();
let mockNotifications: Array<{ id: string; title: string }> = [];

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useNotifications: () => ({
      addNotification: mockAddNotification,
      removeNotification: mockRemoveNotification,
      get notifications() {
        return mockNotifications;
      },
    }),
  }),
);

const { SystemsViewExport } =
  require('./SystemsViewExport') as typeof import('./SystemsViewExport');

const exportState: SystemsViewExportState<SystemsViewItem> = {
  filters: {},
  columns: [],
  sortBy: undefined,
  direction: undefined,
  selectedItems: [],
  total: 42,
};

const openMenu = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Export' }));
};

describe('SystemsViewExport', () => {
  beforeEach(() => {
    mockAddNotification.mockClear();
    mockRemoveNotification.mockClear();
    mockNotifications = [];
  });

  it('renders the default menu item labels', async () => {
    const onExport = jest.fn(async () => {});
    render(
      <SystemsViewExport
        exportConfig={{ onExport }}
        exportState={exportState}
      />,
    );

    await openMenu();

    expect(screen.getByText('Export to CSV')).toBeInTheDocument();
    expect(screen.getByText('Export to JSON')).toBeInTheDocument();
  });

  it('honors custom menu item labels', async () => {
    const onExport = jest.fn(async () => {});
    render(
      <SystemsViewExport
        exportConfig={{
          onExport,
          itemTexts: { csv: 'Download CSV' },
        }}
        exportState={exportState}
      />,
    );

    await openMenu();

    expect(screen.getByText('Download CSV')).toBeInTheDocument();
    expect(screen.getByText('Export to JSON')).toBeInTheDocument();
  });

  it('calls onExport with the format and table state', async () => {
    const onExport = jest.fn(
      async (
        _format: ExportFormat,
        _state: SystemsViewExportState<SystemsViewItem>,
      ) => {},
    );
    render(
      <SystemsViewExport
        exportConfig={{ onExport }}
        exportState={exportState}
      />,
    );

    await openMenu();
    await userEvent.click(screen.getByText('Export to CSV'));

    await waitFor(() => expect(onExport).toHaveBeenCalled());
    expect(onExport).toHaveBeenCalledWith('csv', exportState);
  });

  it('shows the preparing and success toasts around onExport', async () => {
    const onExport = jest.fn(async () => {});
    render(
      <SystemsViewExport
        exportConfig={{ onExport }}
        exportState={exportState}
      />,
    );

    await openMenu();
    await userEvent.click(screen.getByText('Export to JSON'));

    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Preparing export',
        }),
      ),
    );
    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
          title: 'Downloading export',
        }),
      ),
    );
  });

  it('replaces a previous export toast instead of stacking', async () => {
    mockNotifications = [
      { id: 'old-export-toast', title: 'Preparing export' },
      { id: 'unrelated-toast', title: 'Something else' },
    ];
    const onExport = jest.fn(async () => {});
    render(
      <SystemsViewExport
        exportConfig={{ onExport }}
        exportState={exportState}
      />,
    );

    await openMenu();
    await userEvent.click(screen.getByText('Export to JSON'));

    await waitFor(() =>
      expect(mockRemoveNotification).toHaveBeenCalledWith('old-export-toast'),
    );
    expect(mockRemoveNotification).not.toHaveBeenCalledWith('unrelated-toast');
  });

  it('shows the failure toast when onExport rejects', async () => {
    const onExport = jest.fn(async () => {
      throw new Error('export failed');
    });
    render(
      <SystemsViewExport
        exportConfig={{ onExport }}
        exportState={exportState}
      />,
    );

    await openMenu();
    await userEvent.click(screen.getByText('Export to CSV'));

    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Couldn’t download export',
        }),
      ),
    );
  });

  it('disables the menu items while an export is in flight', async () => {
    let resolveExport: () => void = () => {};
    const onExport = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveExport = resolve;
        }),
    );
    render(
      <SystemsViewExport
        exportConfig={{ onExport }}
        exportState={exportState}
      />,
    );

    await openMenu();
    await userEvent.click(screen.getByText('Export to CSV'));

    // Clicking the other format while the export is still in flight must not
    // start a second export.
    await openMenu();
    await userEvent.click(screen.getByText('Export to JSON'));
    expect(onExport).toHaveBeenCalledTimes(1);

    resolveExport();
    await waitFor(() =>
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'success' }),
      ),
    );
  });
});
