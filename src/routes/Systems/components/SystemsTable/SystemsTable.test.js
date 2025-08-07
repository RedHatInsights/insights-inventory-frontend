import React from 'react';
import { render } from '@testing-library/react';
import SystemsTable from './SystemsTable';
import { TableToolsTable } from 'bastilian-tabletools';
import { fetchSystems } from '../../helpers.js';

jest.mock('bastilian-tabletools', () => ({
  TableToolsTable: jest.fn(() => (
    <div data-testid="table-tools-table">TableToolsTable</div>
  )),
}));

// Mock the filters module to break the circular dependency
jest.mock('./filters', () => ({
  CUSTOM_FILTER_TYPES: {},
  default: [],
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
        items: fetchSystems,
      }),
      expect.anything(),
    );
  });

  it('should pass items array', () => {
    const items = [{}, {}, {}];

    render(<SystemsTable items={items} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        items: items,
      }),
      expect.anything(),
    );
  });

  it('should pass items fn', () => {
    const items = () => [{}, {}, {}];

    render(<SystemsTable items={items} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        items: items,
      }),
      expect.anything(),
    );
  });

  it('should pass an empty array, when columns not provided', () => {
    render(<SystemsTable />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [],
      }),
      expect.anything(),
    );
  });

  it('should pass columns array', () => {
    const columns = [{}, {}, {}];

    render(<SystemsTable columns={columns} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: columns,
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
        columns: columns,
      }),
      expect.anything(),
    );
  });

  it('should pass filters object', () => {
    const filters = { filterConfig: [{}, {}, {}], customeFilterTypes: {} };

    render(<SystemsTable filters={filters} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: filters,
      }),
      expect.anything(),
    );
  });

  it('should pass filters object, when filters fn is received', () => {
    const filters = { filterConfig: [{}, {}, {}], customeFilterTypes: {} };

    render(<SystemsTable filters={() => filters} />);
    expect(TableToolsTable).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: filters,
      }),
      expect.anything(),
    );
  });
});
