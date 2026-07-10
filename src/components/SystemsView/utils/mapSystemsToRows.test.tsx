import { isDataViewTdObject } from '@patternfly/react-data-view';
import { expect, jest } from '@jest/globals';
import React from 'react';
import type { Column } from '../columns/allColumnDefinitions';
import type { System } from '../../InventoryViews/hooks/useHostsQuery';
import { DEFAULT_NAME_COLUMN_MIN_WIDTH } from './columnMinWidths';
import { mapSystemsToRows } from './mapSystemsToRows';
import { STICKY_ACTIONS_BODY_PROPS } from './stickyActionsColumn';
import { getStickyNameBodyProps } from './stickyNameColumn';

jest.mock('../SystemsViewRowActions', () => ({
  __esModule: true,
  default: jest.fn(({ system }: { system: { id: string } }) =>
    React.createElement('span', { 'data-testid': 'row-actions' }, system.id),
  ),
}));

const mockSystem = {
  id: 'host-1',
  display_name: 'Test Host',
} as System;

function createColumn(
  overrides: Partial<Column> & Pick<Column, 'key' | 'renderCell'>,
): Column {
  return {
    title: overrides.key,
    isShown: true,
    isShownByDefault: true,
    ...overrides,
  } as Column;
}

describe('mapSystemsToRows', () => {
  it('returns an empty array when data is undefined or empty', () => {
    const columns = [
      createColumn({
        key: 'name',
        renderCell: () => 'Name',
      }),
    ];

    expect(
      mapSystemsToRows({
        data: undefined,
        columns,
        isInventoryViewsEnabled: false,
      }),
    ).toEqual([]);
    expect(
      mapSystemsToRows({ data: [], columns, isInventoryViewsEnabled: false }),
    ).toEqual([]);
  });

  it('maps each system to a row with id, meta, and a trailing actions cell', () => {
    const rows = mapSystemsToRows({
      data: [mockSystem],
      columns: [
        createColumn({
          key: 'name',
          renderCell: () => 'Name',
        }),
      ],
      isInventoryViewsEnabled: false,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('host-1');
    expect(rows[0].meta).toBe(mockSystem);
    expect(rows[0].row).toHaveLength(2);

    const actionsCell = rows[0].row[1];
    expect(isDataViewTdObject(actionsCell)).toBe(true);
    if (isDataViewTdObject(actionsCell)) {
      expect(actionsCell.props).toEqual({ isActionCell: true });
    }
  });

  it('renders column only when isShown is true', () => {
    const renderShownCell = jest.fn<Column['renderCell']>(() => 'Shown');
    const renderHiddenCell = jest.fn<Column['renderCell']>(() => 'Hidden');

    mapSystemsToRows({
      data: [mockSystem],
      columns: [
        createColumn({
          key: 'name',
          renderCell: renderShownCell,
        }),
        createColumn({
          key: 'tags',
          isShown: false,
          renderCell: renderHiddenCell,
        }),
      ],
      isInventoryViewsEnabled: false,
    });

    expect(renderShownCell).toHaveBeenCalledWith(mockSystem);
    expect(renderHiddenCell).not.toHaveBeenCalled();
  });

  describe('when inventory views are disabled', () => {
    it('returns plain cells without sticky or min-width props', () => {
      const rows = mapSystemsToRows({
        data: [mockSystem],
        columns: [
          createColumn({
            key: 'name',
            minWidth: '12rem',
            renderCell: () => 'Name',
          }),
          createColumn({
            key: 'workspace',
            minWidth: '9rem',
            renderCell: () => 'Workspace',
          }),
        ],
        isInventoryViewsEnabled: false,
      });

      const [nameCell, workspaceCell, actionsCell] = rows[0].row;

      expect(nameCell).toBe('Name');
      expect(workspaceCell).toBe('Workspace');
      expect(isDataViewTdObject(actionsCell)).toBe(true);
      if (isDataViewTdObject(actionsCell)) {
        expect(actionsCell.props).toEqual({ isActionCell: true });
        expect(actionsCell.props).not.toHaveProperty('isStickyColumn');
      }
    });
  });

  describe('when inventory views are enabled', () => {
    it('wraps the name column with sticky body props', () => {
      const rows = mapSystemsToRows({
        data: [mockSystem],
        columns: [
          createColumn({
            key: 'name',
            minWidth: '12rem',
            renderCell: () => 'Name',
          }),
        ],
        isInventoryViewsEnabled: true,
      });

      const nameCell = rows[0].row[0];
      expect(isDataViewTdObject(nameCell)).toBe(true);
      if (isDataViewTdObject(nameCell)) {
        expect(nameCell.cell).toBe('Name');
        expect(nameCell.props).toEqual(getStickyNameBodyProps('12rem'));
      }
    });

    it('wraps the actions cell with sticky props', () => {
      const rows = mapSystemsToRows({
        data: [mockSystem],
        columns: [
          createColumn({
            key: 'name',
            renderCell: () => 'Name',
          }),
        ],
        isInventoryViewsEnabled: true,
      });

      const actionsCell = rows[0].row[1];
      expect(isDataViewTdObject(actionsCell)).toBe(true);
      if (isDataViewTdObject(actionsCell)) {
        expect(actionsCell.props).toEqual({
          ...STICKY_ACTIONS_BODY_PROPS,
          isActionCell: true,
        });
      }
    });

    it('uses the default name min-width when the column omits minWidth', () => {
      const rows = mapSystemsToRows({
        data: [mockSystem],
        columns: [
          createColumn({
            key: 'name',
            renderCell: () => 'Name',
          }),
        ],
        isInventoryViewsEnabled: true,
      });

      const nameCell = rows[0].row[0];
      expect(isDataViewTdObject(nameCell)).toBe(true);
      if (isDataViewTdObject(nameCell)) {
        expect(nameCell.props).toEqual(
          getStickyNameBodyProps(DEFAULT_NAME_COLUMN_MIN_WIDTH),
        );
      }
    });
  });
});
