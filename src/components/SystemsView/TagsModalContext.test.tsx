import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { expect, jest } from '@jest/globals';
import { createTestQueryClient } from '../../Utilities/TestingUtilities';
import type { System } from '../InventoryViews/hostsQueryOptions';
import {
  TagsModalProvider,
  useTagsModalContext,
  type OpenTagsModalOptions,
} from './TagsModalContext';
import { DataViewFiltersContext } from './DataViewFiltersContext';
import { defaultValuesFrom } from './filters/defaultValuesFrom';
import { inventoryFilterSpecs } from './filters/inventory/filterDefinitions';

jest.mock('../../Utilities/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value: string) => value,
}));

jest.mock('./hooks/useTagsQuery', () => ({
  __esModule: true,
  useTagsQuery: jest.fn(() => ({
    data: [],
    total: 0,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  })),
}));

const testSystem = {
  id: 'host-1',
  display_name: 'Test Host',
} as System;

function OpenTagsModalButton({
  systems = [testSystem],
  options,
}: {
  systems?: System[];
  options?: OpenTagsModalOptions;
}) {
  const { openTagsModal } = useTagsModalContext();
  return (
    <button type="button" onClick={() => openTagsModal(systems, options)}>
      Open tags modal
    </button>
  );
}

function renderWithProvider(
  ui: React.ReactNode,
  { withFilters = false }: { withFilters?: boolean } = {},
) {
  const onSetFilters = jest.fn();
  const provider = (
    <QueryClientProvider client={createTestQueryClient()}>
      <TagsModalProvider>{ui}</TagsModalProvider>
    </QueryClientProvider>
  );

  const tree = withFilters ? (
    <DataViewFiltersContext.Provider
      value={{
        filters: { ...defaultValuesFrom(inventoryFilterSpecs) },
        resolvedFilters: [],
        onSetFilters,
        clearAllFilters: jest.fn(),
        filtersDifferFromDefaults: false,
        lastSeenCustomRange: null,
        setLastSeenCustomRange: jest.fn(),
        ungroupedWorkspaceId: undefined,
      }}
    >
      {provider}
    </DataViewFiltersContext.Provider>
  ) : (
    provider
  );

  return {
    onSetFilters,
    ...render(tree),
  };
}

describe('TagsModalProvider (single-host tags modal)', () => {
  it('does not show the tags modal until openTagsModal is called', () => {
    renderWithProvider(<OpenTagsModalButton />);

    expect(
      screen.queryByRole('heading', { name: /test host/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the single-host tags modal for the selected system', async () => {
    renderWithProvider(<OpenTagsModalButton />);

    await userEvent.click(
      screen.getByRole('button', { name: /open tags modal/i }),
    );

    expect(
      screen.getByRole('heading', { name: 'Test Host (0)' }),
    ).toBeInTheDocument();
  });
});

describe('TagsModalProvider (all tags modal)', () => {
  it('does not show the all-tags modal until openTagsModal is called with no systems', () => {
    renderWithProvider(<OpenTagsModalButton systems={[]} />, {
      withFilters: true,
    });

    expect(
      screen.queryByRole('heading', { name: /all tags in inventory/i }),
    ).not.toBeInTheDocument();
  });

  it('opens the all-tags modal when openTagsModal is called with an empty selection', async () => {
    renderWithProvider(<OpenTagsModalButton systems={[]} />, {
      withFilters: true,
    });

    await userEvent.click(
      screen.getByRole('button', { name: /open tags modal/i }),
    );

    expect(
      screen.getByRole('heading', { name: /all tags in inventory/i }),
    ).toBeInTheDocument();
  });
});
