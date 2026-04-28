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
      selectedGroupIds={[]}
      setSelectedGroupIds={() => {}}
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
      groups={[{ id: 'g1', name: 'group-1' }]}
      selectedGroupIds={[]}
      setSelectedGroupIds={() => {}}
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
      groups={[{ id: 'g1', name: 'group-1' }]}
      selectedGroupIds={[]}
      setSelectedGroupIds={setter}
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
  expect(setter).toHaveBeenCalledWith(['g1']);
});

it('selected groups are checked', async () => {
  render(
    <SearchableGroupFilter
      searchQuery=""
      setSearchQuery={() => {}}
      groups={[
        { id: 'g1', name: 'group-1' },
        { id: 'g2', name: 'group-2' },
      ]}
      selectedGroupIds={['g1']}
      setSelectedGroupIds={setter}
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
