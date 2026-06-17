import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SearchableGroupFilter from './SearchableGroupFilter';

const setter = jest.fn();

it('shows no groups available message', async () => {
  render(
    <SearchableGroupFilter
      searchQuery=""
      setSearchQuery={() => {}}
      groups={[]}
      selectedGroupNames={[]}
      setSelectedGroupNames={() => {}}
      isLoading={false}
      isFetchingNextPage={false}
      hasNextPage={false}
      fetchNextPage={() => {}}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  expect(screen.getByText('No workspaces available')).toBeVisible();
});

it('shows some groups when available', async () => {
  render(
    <SearchableGroupFilter
      searchQuery=""
      setSearchQuery={() => {}}
      groups={[{ id: 'group-1', name: 'group-1' }]}
      selectedGroupNames={[]}
      setSelectedGroupNames={() => {}}
      isLoading={false}
      isFetchingNextPage={false}
      hasNextPage={false}
      fetchNextPage={() => {}}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  expect(
    screen.getByRole('menuitem', {
      name: /group-1/i,
    }),
  ).toBeVisible();
});

it('a group can be selected', async () => {
  render(
    <SearchableGroupFilter
      searchQuery=""
      setSearchQuery={() => {}}
      groups={[{ id: 'group-1', name: 'group-1' }]}
      selectedGroupNames={[]}
      setSelectedGroupNames={setter}
      isLoading={false}
      isFetchingNextPage={false}
      hasNextPage={false}
      fetchNextPage={() => {}}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  await userEvent.click(screen.getByText('group-1'));
  expect(setter).toHaveBeenCalledWith([{ id: 'group-1', name: 'group-1' }]);
});

it('selected groups are checked', async () => {
  render(
    <SearchableGroupFilter
      searchQuery=""
      setSearchQuery={() => {}}
      groups={[
        { id: 'group-1', name: 'group-1' },
        { id: 'group-2', name: 'group-2' },
      ]}
      selectedGroupNames={[{ id: 'group-1', name: 'group-1' }]}
      setSelectedGroupNames={setter}
      isLoading={false}
      isFetchingNextPage={false}
      hasNextPage={false}
      fetchNextPage={() => {}}
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  expect(
    screen.getByRole('checkbox', {
      name: /group-1/,
    }),
  ).toBeChecked();
});

it('ungrouped hosts can be selected by workspace id', async () => {
  const ungroupedWorkspace = {
    id: 'ungrouped-ws-id',
    name: 'Ungrouped hosts',
    ungrouped: true,
  };
  render(
    <SearchableGroupFilter
      searchQuery=""
      setSearchQuery={() => {}}
      groups={[]}
      ungroupedWorkspace={ungroupedWorkspace}
      selectedGroupNames={[]}
      setSelectedGroupNames={setter}
      isLoading={false}
      isFetchingNextPage={false}
      hasNextPage={false}
      fetchNextPage={() => {}}
      showNoGroupOption
    />,
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    }),
  );
  await userEvent.click(screen.getByText('Ungrouped hosts'));
  expect(setter).toHaveBeenCalledWith([ungroupedWorkspace]);
});
