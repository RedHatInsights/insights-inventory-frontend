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

  it('prevents badge clipping for long tag names by setting proper flex layout', async () => {
    useTagsQuery.mockReturnValue({
      data: [
        {
          tag: {
            namespace: 'insights',
            key: 'very-long-tag-key-that-might-overflow-the-menu-option',
            value: 'very-long-tag-value-that-needs-truncation',
          },
          count: 10,
        },
      ],
      total: 1,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));
    const badge = screen.getByText('10');
    expect(badge).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    const flexContainer = badge.closest('.pf-v6-l-flex');
    expect(flexContainer).toHaveClass(
      'pf-m-full-width',
      'pf-m-justify-content-space-between',
    );
    expect(flexContainer).toHaveStyle({
      width: '100%',
      justifyContent: 'space-between',
    });
    // eslint-disable-next-line testing-library/no-node-access
    expect(flexContainer.children).toHaveLength(2);
    // eslint-disable-next-line testing-library/no-node-access
    const [tagNameFlexItem, badgeFlexItem] = flexContainer.children;
    expect(tagNameFlexItem).toHaveStyle({ minWidth: 0 });
    expect(badgeFlexItem).toHaveClass('pf-m-flex-none');
    expect(badgeFlexItem).toHaveStyle({ flexShrink: 0 });
    expect(badgeFlexItem).toContainElement(badge);
  });

  it('preserves non-shrinking badge layout across multiple tags with different counts and name lengths', async () => {
    useTagsQuery.mockReturnValue({
      data: [
        {
          tag: {
            namespace: 'namespace-one',
            key: 'short',
            value: 'val',
          },
          count: 1,
        },
        {
          tag: {
            namespace: 'namespace-two',
            key: 'a-very-long-tag-key-with-extended-characters',
            value: 'and-a-very-long-value-that-stretches-the-row-width',
          },
          count: 99999,
        },
      ],
      total: 2,
      isLoading: false,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderTagsFilter();
    await user.click(screen.getByPlaceholderText('Filter by tags'));

    const badgeOne = screen.getByText('1');
    const badgeTwo = screen.getByText('99999');

    [badgeOne, badgeTwo].forEach((badge) => {
      // eslint-disable-next-line testing-library/no-node-access
      const flexContainer = badge.closest('.pf-v6-l-flex');
      expect(flexContainer).toHaveClass(
        'pf-m-nowrap',
        'pf-m-full-width',
        'pf-m-justify-content-space-between',
      );
      expect(flexContainer).toHaveStyle({
        width: '100%',
        justifyContent: 'space-between',
      });
      // eslint-disable-next-line testing-library/no-node-access
      const [nameItem, badgeItem] = flexContainer.children;
      expect(nameItem).toHaveStyle({ minWidth: 0 });
      expect(badgeItem).toHaveClass('pf-m-flex-none');
      expect(badgeItem).toHaveStyle({ flexShrink: 0 });
      expect(badgeItem).toContainElement(badge);
    });
  });
});
