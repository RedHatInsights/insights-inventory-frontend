import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { WorkspaceFilter, UNGROUPED_HOSTS_LABEL } from './WorkspaceFilter';
import {
  makePage,
  mockGroupsInfiniteQuery,
  useWorkspaceGroupsInfiniteQuery,
} from './__fixtures__/testHelpers';

jest.mock('../../../constants', () => ({
  ...jest.requireActual('../../../constants'),
  DEBOUNCE_TIMEOUT_MS: 0,
}));

jest.mock('../../filters/useWorkspaceGroupsInfiniteQuery', () => ({
  useWorkspaceGroupsInfiniteQuery: jest.fn(),
}));

const WORKSPACE_FILTER_PLACEHOLDER = 'Filter by workspace';

function renderWorkspaceFilter(props = {}) {
  return render(
    <WorkspaceFilter placeholder={WORKSPACE_FILTER_PLACEHOLDER} {...props} />,
  );
}

async function openWorkspaceMenu(user) {
  await user.click(screen.getByPlaceholderText(WORKSPACE_FILTER_PLACEHOLDER));
}

describe('WorkspaceFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWorkspaceGroupsInfiniteQuery.mockReset();
  });

  it('renders the workspace filter', () => {
    mockGroupsInfiniteQuery({ isPending: true });
    renderWorkspaceFilter();
    expect(
      screen.getByRole('textbox', { name: /type to filter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(WORKSPACE_FILTER_PLACEHOLDER),
    ).toBeInTheDocument();
  });

  it('shows a loading option while groups are pending', async () => {
    mockGroupsInfiniteQuery({ isPending: true });
    const user = userEvent.setup();
    renderWorkspaceFilter();
    await openWorkspaceMenu(user);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows Ungrouped hosts when API returns no groups and user is not searching', async () => {
    mockGroupsInfiniteQuery({
      pages: [makePage([])],
      isPending: false,
    });
    const user = userEvent.setup();
    renderWorkspaceFilter();
    await openWorkspaceMenu(user);
    expect(screen.getByText(UNGROUPED_HOSTS_LABEL)).toBeInTheDocument();
    expect(
      screen.queryByText('No workspaces available'),
    ).not.toBeInTheDocument();
  });

  it('shows "No workspaces available" when search has no matches', async () => {
    useWorkspaceGroupsInfiniteQuery.mockImplementation((debouncedSearch) => {
      const empty = [makePage([], { total: 0 })];
      const withGroup = [
        makePage([{ id: 'w1', name: 'Workspace 1', host_count: 1 }]),
      ];
      return {
        data: {
          pages: debouncedSearch ? empty : withGroup,
          pageParams: [1],
        },
        fetchNextPage: jest.fn().mockResolvedValue(undefined),
        hasNextPage: false,
        isFetching: false,
        isPending: false,
      };
    });

    const user = userEvent.setup();
    renderWorkspaceFilter();
    await openWorkspaceMenu(user);
    expect(screen.getByText('Workspace 1')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(WORKSPACE_FILTER_PLACEHOLDER);
    await user.type(input, 'nomatch');

    expect(
      await screen.findByText('No workspaces available'),
    ).toBeInTheDocument();
  });

  it('lists workspace names and host counts after open', async () => {
    mockGroupsInfiniteQuery({
      pages: [
        makePage([
          { id: 'a1', name: 'Alpha', host_count: 10 },
          { id: 'b1', name: 'Beta', host_count: 2 },
        ]),
      ],
    });
    const user = userEvent.setup();
    renderWorkspaceFilter();
    await openWorkspaceMenu(user);
    expect(screen.getByText(UNGROUPED_HOSTS_LABEL)).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows an em dash in the badge when host_count is not a number', async () => {
    mockGroupsInfiniteQuery({
      pages: [makePage([{ id: 'g1', name: 'Gamma', host_count: undefined }])],
    });
    const user = userEvent.setup();
    renderWorkspaceFilter();
    await openWorkspaceMenu(user);
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calls onChange with the selected workspace when an option is chosen', async () => {
    mockGroupsInfiniteQuery({
      pages: [makePage([{ id: 'w1', name: 'Workspace 1', host_count: 1 }])],
    });
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWorkspaceFilter({ onChange, value: [] });
    await openWorkspaceMenu(user);
    const row = screen.getByRole('menuitem', { name: /Workspace 1/i });
    await user.click(within(row).getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1);
    expect(last[1]).toEqual(['w1']);
  });

  it('toggles off a selected workspace when its checkbox is clicked again', async () => {
    mockGroupsInfiniteQuery({
      pages: [makePage([{ id: 'w1', name: 'Workspace 1', host_count: 1 }])],
    });
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWorkspaceFilter({ onChange, value: ['w1'] });
    await openWorkspaceMenu(user);
    const row = screen.getByRole('menuitem', { name: /Workspace 1/i });
    await user.click(within(row).getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1);
    expect(last[1]).toEqual([]);
  });

  it('calls fetchNextPage when Show more is clicked', async () => {
    const { fetchNextPage } = mockGroupsInfiniteQuery({
      pages: [
        makePage(
          Array.from({ length: 50 }, (_, i) => ({
            id: `ws-${i}`,
            name: `WS-${i}`,
            host_count: 1,
          })),
          { total: 100 },
        ),
      ],
      hasNextPage: true,
      isFetching: false,
    });
    const user = userEvent.setup();
    renderWorkspaceFilter();
    await openWorkspaceMenu(user);
    await user.click(screen.getByText('Show more'));
    expect(fetchNextPage).toHaveBeenCalled();
  });
});
