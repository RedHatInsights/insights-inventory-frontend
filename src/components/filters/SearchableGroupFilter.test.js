import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SearchableGroupFilter from './SearchableGroupFilter';

const setter = jest.fn();

it('shows no groups available message', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[]}
      selectedGroupNames={[]}
      setSelectedGroupNames={() => {}}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  expect(screen.getByText('No groups available')).toBeVisible();
});

it('shows some groups when available', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[{ name: 'group-1' }]}
      selectedGroupNames={[]}
      setSelectedGroupNames={() => {}}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  expect(
    screen.getByRole('option', {
      name: /group-1/i,
    })
  ).toBeVisible();
});

it('a group can be selected', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[{ name: 'group-1' }]}
      selectedGroupNames={[]}
      setSelectedGroupNames={setter}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  await userEvent.click(screen.getByText('group-1'));
  expect(setter).toBeCalledWith(['group-1']);
});

it('selected groups are checked', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[{ name: 'group-1' }, { name: 'group-2' }]}
      selectedGroupNames={['group-1']}
      setSelectedGroupNames={setter}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  expect(
    screen.getByRole('option', {
      name: /group-1/i,
    })
  ).toHaveAttribute('aria-selected', 'true');
});

it('shows no group option', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[{ name: 'group-1' }, { name: 'group-2' }]}
      selectedGroupNames={[]}
      setSelectedGroupNames={setter}
      showNoGroupOption={true}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  expect(
    screen.getByRole('option', {
      name: /no group/i,
    })
  ).toBeVisible();
});

it('can select no group option', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[{ name: 'group-1' }, { name: 'group-2' }]}
      selectedGroupNames={[]}
      setSelectedGroupNames={setter}
      showNoGroupOption={true}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  await userEvent.click(screen.getByText('No group'));
  expect(setter).toBeCalledWith(['']);
});

it('can select no group option with pre-selected item', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[{ name: 'group-1' }, { name: 'group-2' }]}
      selectedGroupNames={['group-1']}
      setSelectedGroupNames={setter}
      showNoGroupOption={true}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  await userEvent.click(screen.getByText('No group'));
  expect(setter).toBeCalledWith(['group-1', '']);
});

it('shows no group as the only option', async () => {
  render(
    <SearchableGroupFilter
      initialGroups={[]}
      selectedGroupNames={[]}
      setSelectedGroupNames={setter}
      showNoGroupOption={true}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /menu toggle/i,
    })
  );
  expect(
    screen.getByRole('option', {
      name: /no group/i,
    })
  ).toBeVisible();
  expect(screen.getAllByRole('option').length).toBe(1);
});
