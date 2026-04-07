import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

jest.mock('../../../Utilities/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value) => value,
}));

jest.mock('../../../api/hostInventoryApiTyped', () => ({
  getTagList: jest.fn(),
}));

import { AllTagsModal } from './AllTagsModal';
import { FIRST_TAG_FILTER_TOKEN, TAGS_100 } from './__fixtures__/tags';
import {
  DataViewFiltersContext,
  INITIAL_INVENTORY_FILTERS,
} from '../DataViewFiltersContext';
import { getTagList } from '../../../api/hostInventoryApiTyped';

const defaultApiTags = {
  results: [{ tag: TAGS_100[0] }],
  total: 1,
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderWithFilters(ui, options) {
  const {
    filters,
    onSetFilters = jest.fn(),
    clearAllFilters = jest.fn(),
  } = options;
  const queryClient = createTestQueryClient();
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <DataViewFiltersContext.Provider
          value={{ filters, onSetFilters, clearAllFilters }}
        >
          {ui}
        </DataViewFiltersContext.Provider>
      </QueryClientProvider>,
    ),
  };
}

describe('AllTagsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getTagList.mockResolvedValue(defaultApiTags);
  });

  it('does not request tags when modal is closed', async () => {
    renderWithFilters(<AllTagsModal isOpen={false} onClose={jest.fn()} />, {
      filters: { ...INITIAL_INVENTORY_FILTERS },
    });
    await waitFor(() => {
      expect(getTagList).not.toHaveBeenCalled();
    });
  });

  it('requests tags when modal is open', async () => {
    renderWithFilters(<AllTagsModal isOpen onClose={jest.fn()} />, {
      filters: { ...INITIAL_INVENTORY_FILTERS },
    });
    await waitFor(() => {
      expect(getTagList).toHaveBeenCalled();
    });
  });

  it('renders inventory title and server-driven modal body flag', () => {
    renderWithFilters(<AllTagsModal isOpen onClose={jest.fn()} />, {
      filters: { ...INITIAL_INVENTORY_FILTERS },
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /All tags in inventory/,
    );
    expect(screen.getByTestId('tags-modal-body')).toHaveAttribute(
      'data-tags-modal-client-controlled',
      'false',
    );
  });

  it('renders tag rows from API after query settles', async () => {
    renderWithFilters(<AllTagsModal isOpen onClose={jest.fn()} />, {
      filters: { ...INITIAL_INVENTORY_FILTERS },
    });
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'key-0' })).toBeInTheDocument();
    });
    expect(screen.getByRole('cell', { name: 'value-0' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'namespace-0' }),
    ).toBeInTheDocument();
  });

  it('disables Apply when selection matches initial filter tags', async () => {
    const filters = {
      ...INITIAL_INVENTORY_FILTERS,
      tags: [FIRST_TAG_FILTER_TOKEN],
    };
    renderWithFilters(<AllTagsModal isOpen onClose={jest.fn()} />, {
      filters,
    });
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'key-0' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('calls onSetFilters when Apply is used after selecting a tag', async () => {
    const user = userEvent.setup();
    const onSetFilters = jest.fn();
    const onClose = jest.fn();
    const filters = {
      ...INITIAL_INVENTORY_FILTERS,
      tags: [],
    };
    renderWithFilters(<AllTagsModal isOpen onClose={onClose} />, {
      filters,
      onSetFilters,
    });
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'key-0' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    const tagRow = screen.getByRole('row', { name: /key-0/ });
    const rowCheckbox = within(tagRow).getByRole('checkbox');
    await user.click(rowCheckbox);

    const apply = screen.getByRole('button', { name: 'Apply' });
    expect(apply).toBeEnabled();
    await user.click(apply);

    expect(onSetFilters).toHaveBeenCalledWith({
      tags: [FIRST_TAG_FILTER_TOKEN],
    });
    expect(onClose).toHaveBeenCalled();
  });
});
