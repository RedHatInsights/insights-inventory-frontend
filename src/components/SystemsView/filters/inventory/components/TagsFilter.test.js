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

  it('renders tag options with full width flex container, minWidth 0 for truncate, and non-shrinking badge', async () => {
    useTagsQuery.mockReturnValue({
      data: [
        {
          tag: {
            namespace: 'insights',
            key: 'very-long-tag-name-key',
            value: 'very-long-tag-name-value-that-needs-truncation',
          },
          count: 5,
        },
      ],
      total: 1,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));

    const row = screen.getByRole('menuitem', {
      name: /very-long-tag-name-key=very-long-tag-name-value/i,
    });
    expect(row).toBeInTheDocument();

    // The option content should be wrapped in a full-width flex container
    // eslint-disable-next-line testing-library/no-node-access
    const flexContainer = row.querySelector('.pf-v6-l-flex');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveClass('pf-m-justify-content-space-between');
    expect(flexContainer).toHaveClass('pf-m-full-width');
    expect(flexContainer).toHaveClass('pf-m-nowrap');
    expect(flexContainer).toHaveStyle({ width: '100%' });

    // The tag name flex item has minWidth: 0 to allow Truncate to shrink
    const nameFlexItem = flexContainer.children[0];
    expect(nameFlexItem).toHaveStyle({ minWidth: 0 });
    // eslint-disable-next-line testing-library/no-node-access
    const truncate = nameFlexItem.querySelector('.pf-v6-c-truncate');
    expect(truncate).toBeInTheDocument();
    expect(truncate).toHaveTextContent(
      'very-long-tag-name-key=very-long-tag-name-value-that-needs-truncation',
    );

    // The badge flex item has flexNone and flexShrink: 0 to prevent shrinking
    const badgeFlexItem = flexContainer.children[1];
    expect(badgeFlexItem).toHaveClass('pf-m-flex-none');
    expect(badgeFlexItem).toHaveStyle({ flexShrink: '0' });

    // The badge shows the count
    const badge = within(badgeFlexItem).getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('pf-v6-c-badge');
  });

  it('displays tooltip with singular system count when count is 1', async () => {
    useTagsQuery.mockReturnValue({
      data: [
        {
          tag: { namespace: 'insights', key: 'env', value: 'stage' },
          count: 1,
        },
      ],
      total: 1,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));

    const badge = screen.getByText('1');
    await user.hover(badge);
    expect(
      await screen.findByText('Applicable to 1 system.'),
    ).toBeInTheDocument();
  });

  it('displays tooltip with plural systems count when count is greater than 1', async () => {
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
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));

    const badge = screen.getByText('3');
    await user.hover(badge);
    expect(
      await screen.findByText('Applicable to 3 systems.'),
    ).toBeInTheDocument();
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
