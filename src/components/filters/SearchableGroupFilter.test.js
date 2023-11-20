import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SearchableGroupFilter from './SearchableGroupFilter';

const setter = jest.fn();

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
    screen.getByRole('menuitem', {
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
  expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
});
