/* eslint-disable react/prop-types -- test file; no PropTypes */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { OperatingSystemsFilter } from './OperatingSystemsFilter';
import { useOperatingSystemsQuery } from '../hooks/useOperatingSystemsQuery';

jest.mock('../hooks/useOperatingSystemsQuery', () => ({
  useOperatingSystemsQuery: jest.fn(),
}));

/** Shape matches mapOperatingSystemApiResultsToVersionRows input; hook returns `data` as this array. */
const rhel9Results = [
  { value: { name: 'RHEL', major: 9, minor: 0 } },
  { value: { name: 'RHEL', major: 9, minor: 1 } },
];

/** Order matches `osVersionSorter` within a major (higher minor first). */
const GROUP_TOKENS = ['RHEL9.1', 'RHEL9.0'];

function mockLoadedOperatingSystems(data = rhel9Results) {
  useOperatingSystemsQuery.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    isFetched: true,
  });
}

async function openOperatingSystemsMenu(
  user,
  placeholder = /filter by operating system/i,
) {
  await user.click(screen.getByRole('button', { name: placeholder }));
}

function ControlledOperatingSystemsFilter({
  initialValue = [],
  onChange,
  ...rest
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <OperatingSystemsFilter
      {...rest}
      value={value}
      onChange={(event, next) => {
        onChange?.(event, next);
        setValue(Array.isArray(next) ? next : []);
      }}
    />
  );
}

describe('OperatingSystemsFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the toggle and lists RHEL major group and versions after open', async () => {
    mockLoadedOperatingSystems();
    const user = userEvent.setup();
    render(<OperatingSystemsFilter />);
    await openOperatingSystemsMenu(user);
    expect(
      screen.getByRole('checkbox', { name: /^RHEL 9$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'RHEL 9.0' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'RHEL 9.1' }),
    ).toBeInTheDocument();
  });

  it('shows a loading spinner while operating systems are loading', async () => {
    useOperatingSystemsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isFetched: false,
    });
    const user = userEvent.setup();
    render(<OperatingSystemsFilter />);
    await openOperatingSystemsMenu(user);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows an error message when the query fails', async () => {
    useOperatingSystemsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isFetched: true,
    });
    const user = userEvent.setup();
    render(<OperatingSystemsFilter />);
    await openOperatingSystemsMenu(user);
    expect(
      screen.getByRole('option', { name: /unable to load operating systems/i }),
    ).toBeInTheDocument();
  });

  it('shows "No versions available" when fetch completed with no rows', async () => {
    useOperatingSystemsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isFetched: true,
    });
    const user = userEvent.setup();
    render(<OperatingSystemsFilter />);
    await openOperatingSystemsMenu(user);
    expect(screen.getByText('No versions available')).toBeInTheDocument();
  });

  it('selects all nested versions when group checkbox is clicked and none were selected', async () => {
    mockLoadedOperatingSystems();
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<OperatingSystemsFilter value={[]} onChange={onChange} />);
    await openOperatingSystemsMenu(user);
    await user.click(screen.getByRole('checkbox', { name: /^RHEL 9$/ }));
    expect(onChange).toHaveBeenCalledWith(undefined, GROUP_TOKENS);
  });

  it('clears all nested versions when group checkbox is clicked while indeterminate', async () => {
    mockLoadedOperatingSystems();
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<OperatingSystemsFilter value={['RHEL9.0']} onChange={onChange} />);
    await openOperatingSystemsMenu(user);
    await user.click(screen.getByRole('checkbox', { name: /^RHEL 9$/ }));
    expect(onChange).toHaveBeenCalledWith(undefined, []);
  });

  it('clears the group when fully selected and group checkbox is unchecked', async () => {
    mockLoadedOperatingSystems();
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <OperatingSystemsFilter value={[...GROUP_TOKENS]} onChange={onChange} />,
    );
    await openOperatingSystemsMenu(user);
    await user.click(screen.getByRole('checkbox', { name: /^RHEL 9$/ }));
    expect(onChange).toHaveBeenCalledWith(undefined, []);
  });

  it('when one version is toggled on from empty selection, group becomes indeterminate', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      mockLoadedOperatingSystems();
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <ControlledOperatingSystemsFilter
          initialValue={[]}
          onChange={onChange}
        />,
      );
      await openOperatingSystemsMenu(user);
      await user.click(screen.getByRole('checkbox', { name: 'RHEL 9.0' }));
      expect(onChange).toHaveBeenCalledWith(undefined, ['RHEL9.0']);
      const groupInput = screen.getByRole('checkbox', { name: /^RHEL 9$/ });
      expect(groupInput).toHaveProperty('indeterminate', true);
      expect(screen.getByRole('checkbox', { name: 'RHEL 9.0' })).toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: 'RHEL 9.1' }),
      ).not.toBeChecked();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('when the second version is selected, the group checkbox is fully checked', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    try {
      mockLoadedOperatingSystems();
      const user = userEvent.setup();
      render(<ControlledOperatingSystemsFilter initialValue={['RHEL9.0']} />);
      await openOperatingSystemsMenu(user);
      expect(screen.getByRole('checkbox', { name: /^RHEL 9$/ })).toHaveProperty(
        'indeterminate',
        true,
      );
      await user.click(screen.getByRole('checkbox', { name: 'RHEL 9.1' }));
      const groupInput = screen.getByRole('checkbox', { name: /^RHEL 9$/ });
      expect(groupInput).toBeChecked();
      expect(groupInput).toHaveProperty('indeterminate', false);
    } finally {
      consoleError.mockRestore();
    }
  });
});
