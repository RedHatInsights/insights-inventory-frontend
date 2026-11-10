import '@testing-library/jest-dom';
import { render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import type { Column } from '../columns/types';
import { useColumns } from './useColumns';

const tagColumn = {
  key: 'tag:insights-client/env',
  title: 'insights-client/env',
  tableHeader: <span>env</span>,
  isShown: true,
  isShownByDefault: true,
  appName: 'tag',
  getValue: () => [],
  renderCell: () => null,
} as Column;

describe('useColumns table headers', () => {
  it('uses tableHeader for the table and leaves title for Manage columns', () => {
    const { result } = renderHook(() =>
      useColumns({
        defaultColumns: [tagColumn],
        sortBy: undefined,
        onSort: jest.fn(),
        direction: 'asc',
        isInventoryViewsEnabled: true,
        deniedServices: [],
        hasRowActions: false,
      }),
    );

    render(<>{result.current.tableHeaderNodes[0].cell}</>);

    expect(screen.getByText('env')).toBeInTheDocument();
    expect(screen.queryByText('insights-client/env')).not.toBeInTheDocument();
    expect(result.current.columns[0].title).toBe('insights-client/env');
  });
});
