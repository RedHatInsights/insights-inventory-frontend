import React from 'react';
import { render } from '@testing-library/react';
import SystemsTable from './SystemsTable';
import { TableToolsTable } from 'bastilian-tabletools';

import defaultColumns from './columns';
import defaultFilterTypes from './filterTypes';

jest.mock('bastilian-tabletools', () => ({
  ...jest.requireActual('bastilian-tabletools'),
  TableToolsTable: jest.fn(() => (
    <div data-testid="table-tools-table">TableToolsTable</div>
  )),
  useItemsData: jest.fn(() => ({
    items: [],
  })),
  useFullTableState: jest.fn(),
  useStateCallbacks: jest.fn(() => ({
    current: { reload: jest.fn(), resetSelection: jest.fn() },
  })),
  TableStateProvider: jest.fn(({ children }) => <div>{children}</div>),
}));

jest.mock('../../../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock('../../helpers.js', () => {
  const actual = jest.requireActual('../../helpers.js');
  return {
    ...actual,
    fetchSystems: jest.fn(),
  };
});

describe('SystemsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass fetchSystems, when no items are provided', () => {
    render(<SystemsTable />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.any(Function),
      }),
      expect.anything(),
    );
  });

  it('should pass items array', () => {
    const items = [{}, {}, {}];

    render(<SystemsTable items={items} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        items,
      }),
      expect.anything(),
    );
  });

  it('should pass items fn', () => {
    const items = () => [{}, {}, {}];

    render(<SystemsTable items={items} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.any(Function),
      }),
      expect.anything(),
    );
  });

  it('should pass default columns, when columns not provided', () => {
    render(<SystemsTable />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: defaultColumns,
      }),
      expect.anything(),
    );
  });

  it('should pass columns array', () => {
    const columns = [{}, {}, {}];

    render(<SystemsTable columns={columns} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns,
      }),
      expect.anything(),
    );
  });

  it('should pass array of columns, when columns fn is received', () => {
    const columns = [{}, {}, {}];
    const columnsFn = () => columns;

    render(<SystemsTable columns={columnsFn} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns,
      }),
      expect.anything(),
    );
  });

  it('should pass filters object', () => {
    const filters = {
      filterConfig: [{}, {}, {}],
      customFilterTypes: defaultFilterTypes,
    };

    render(<SystemsTable filters={filters} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        filters,
      }),
      expect.anything(),
    );
  });

  it('should pass filters object, when filters fn is received', () => {
    const filters = {
      filterConfig: [{}, {}, {}],
      customFilterTypes: defaultFilterTypes,
    };

    render(<SystemsTable filters={() => filters} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        filters,
      }),
      expect.anything(),
    );
  });
});
