import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TagsFilter } from './TagsFilter';
import { SystemActionModalsContext } from '../SystemActionModalsContext';
import { useTagsQuery } from '../hooks/useTagsQuery';

jest.mock('../../../Utilities/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value) => value,
}));

jest.mock('../hooks/useTagsQuery', () => ({
  useTagsQuery: jest.fn(),
}));

const mockOpenTagsModal = jest.fn();

function renderTagsFilter(props = {}) {
  return render(
    <SystemActionModalsContext.Provider
      value={{
        openDeleteModal: jest.fn(),
        openAddToWorkspaceModal: jest.fn(),
        openRemoveFromWorkspaceModal: jest.fn(),
        openEditModal: jest.fn(),
        openTagsModal: mockOpenTagsModal,
      }}
    >
      <TagsFilter placeholder="Filter by tags" {...props} />
    </SystemActionModalsContext.Provider>,
  );
}

describe('TagsFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the tags filter shell', () => {
    useTagsQuery.mockReturnValue({
      data: undefined,
      total: 0,
      isLoading: true,
      isFetching: false,
    });
    renderTagsFilter();
    expect(
      screen.getByRole('textbox', { name: /type to filter/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by tags')).toBeInTheDocument();
  });

  it('shows a loading option while tags are loading', async () => {
    useTagsQuery.mockReturnValue({
      data: undefined,
      total: 0,
      isLoading: true,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows "No tags available" when the query is idle and there are no tags', async () => {
    useTagsQuery.mockReturnValue({
      data: [],
      total: 0,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));
    expect(screen.getByText('No tags available')).toBeInTheDocument();
  });

  it('groups options by namespace and calls onChange when an option is selected', async () => {
    useTagsQuery.mockReturnValue({
      data: [
        {
          tag: { namespace: 'insights', key: 'env', value: 'prod' },
          count: 3,
        },
      ],
      total: 1,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderTagsFilter({ onChange, value: [] });
    await user.click(screen.getByPlaceholderText('Filter by tags'));
    expect(screen.getByText('insights')).toBeInTheDocument();
    const row = screen.getByRole('menuitem', { name: /env=prod/i });
    await user.click(within(row).getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1);
    expect(last[1]).toEqual(['insights/env=prod']);
  });

  it('opens the all-tags modal when "more tags" is chosen', async () => {
    useTagsQuery.mockReturnValue({
      data: Array.from({ length: 50 }, (_, i) => ({
        tag: { namespace: 'ns', key: `k${i}`, value: `v${i}` },
        count: 1,
      })),
      total: 55,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));
    await user.click(await screen.findByText(/^\d+ more tags available$/));
    expect(mockOpenTagsModal).toHaveBeenCalledWith([], {
      initialTagSearch: '',
    });
  });
});
