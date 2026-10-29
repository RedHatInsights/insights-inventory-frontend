import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TagsFilter } from './TagsFilter';
import { TagsModalContext } from '../../../TagsModalContext';
import { useTagsQuery } from '../../../hooks/useTagsQuery';

jest.mock('../../../../../Utilities/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (value) => value,
}));

jest.mock('../../../hooks/useTagsQuery', () => ({
  useTagsQuery: jest.fn(),
}));

const mockOpenTagsModal = jest.fn();

function renderTagsFilter(props = {}) {
  return render(
    <TagsModalContext.Provider
      value={{
        openTagsModal: mockOpenTagsModal,
      }}
    >
      <TagsFilter placeholder="Filter by tags" {...props} />
    </TagsModalContext.Provider>,
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

  it('renders tag options with full width, space-between layout, and non-shrinking count badge', async () => {
    useTagsQuery.mockReturnValue({
      data: [
        {
          tag: {
            namespace: 'custom',
            key: 'very-long-tag-name-that-might-overflow-the-container',
            value: 'very-long-value',
          },
          count: 42,
        },
      ],
      total: 1,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));

    const badge = screen.getByText('42');
    expect(badge).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    const badgeFlexItem = badge.closest('.pf-m-flex-none');
    expect(badgeFlexItem).toBeInTheDocument();
    expect(badgeFlexItem).toHaveStyle({ flexShrink: 0 });

    // eslint-disable-next-line testing-library/no-node-access
    const flexContainer = badgeFlexItem.parentElement;
    expect(flexContainer).toHaveClass(
      'pf-v6-l-flex',
      'pf-m-justify-content-space-between',
      'pf-m-full-width',
      'pf-m-nowrap',
    );
    expect(flexContainer).toHaveStyle({ width: '100%' });

    const tagName = screen.getByText(
      'very-long-tag-name-that-might-overflow-the-container=very-long-value',
    );
    expect(tagName).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(tagName.closest('.pf-v6-c-truncate')).toBeInTheDocument();

    // eslint-disable-next-line testing-library/no-node-access
    const nameFlexItem = tagName.closest('.pf-v6-c-truncate').parentElement;
    expect(nameFlexItem).toHaveStyle({ minWidth: 0 });
  });

  it('formats tooltip text correctly for singular and plural tag counts', async () => {
    useTagsQuery.mockReturnValue({
      data: [
        {
          tag: { namespace: 'insights', key: 'single', value: 'one' },
          count: 1,
        },
        {
          tag: { namespace: 'insights', key: 'multi', value: 'many' },
          count: 5,
        },
      ],
      total: 2,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));

    const badge1 = screen.getByText('1');
    const badge5 = screen.getByText('5');
    expect(badge1).toBeInTheDocument();
    expect(badge5).toBeInTheDocument();

    await user.hover(badge1);
    expect(
      await screen.findByText('Applicable to 1 system.'),
    ).toBeInTheDocument();

    await user.hover(badge5);
    expect(
      await screen.findByText('Applicable to 5 systems.'),
    ).toBeInTheDocument();
  });
});
