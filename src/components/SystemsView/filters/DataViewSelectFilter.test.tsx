import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DataViewCheckboxFilter } from './DataViewCheckboxFilter';
import { DataViewSingleSelectFilter } from './DataViewSingleSelectFilter';

const options = [
  { label: 'Active', value: 'active' },
  { label: 'Stale', value: 'stale' },
];

const shared = {
  filterId: 'status',
  title: 'Status',
  placeholder: 'Status',
  options,
};

describe('DataView select filters', () => {
  it('adds and removes a value in multi-select', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { rerender } = render(
      <DataViewCheckboxFilter {...shared} value={[]} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Status' }));
    await user.click(screen.getByRole('checkbox', { name: 'Active' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), ['active']);

    rerender(
      <DataViewCheckboxFilter
        {...shared}
        value={['active']}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: 'Active' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), []);
  });

  it('keeps the current value when a selected item is clicked in single-select', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <DataViewSingleSelectFilter
        {...shared}
        value={['active']}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Status' }));
    await user.click(screen.getByRole('menuitem', { name: 'Active' }));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Status' }));
    await user.click(screen.getByRole('menuitem', { name: 'Stale' }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), ['stale']);
  });
});
