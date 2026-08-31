import React from 'react';
import { bindColumn } from './bindColumn';
import type { Column, ColumnSpec } from './types';

type HostItem = { id: string; display_name: string };
type PatchItem = { id: string; hostname: string };

const nameSpec: ColumnSpec<{ displayName: string }> = {
  key: 'display_name',
  title: 'Name',
  appName: 'inventory',
  renderCell: (value) => value.displayName,
};

describe('bindColumn', () => {
  it('merges spec identity with a consumer getValue and sortBy override', () => {
    const column = bindColumn(nameSpec, {
      getValue: (item: HostItem) => ({ displayName: item.display_name }),
      sortBy: 'display_name',
    });

    expect(column.key).toBe('display_name');
    expect(column.sortBy).toBe('display_name');
    expect(column.getValue({ id: '1', display_name: 'host-a' })).toEqual({
      displayName: 'host-a',
    });
    expect(column.renderCell({ displayName: 'host-a' })).toBe('host-a');
  });

  it('allows mixing bindings of the same TItem in one array', () => {
    const columns: Column<HostItem>[] = [
      bindColumn(nameSpec, {
        getValue: (item) => ({ displayName: item.display_name }),
      }),
      bindColumn(nameSpec, {
        getValue: (item) => ({ displayName: item.display_name.toUpperCase() }),
        sortBy: 'display_name',
      }),
    ];

    expect(columns).toHaveLength(2);
    expect(columns[1].getValue({ id: '1', display_name: 'abc' })).toEqual({
      displayName: 'ABC',
    });
  });

  it('defaults visibility to shown unless the binding overrides it', () => {
    const shown = bindColumn(nameSpec, {
      getValue: (item: HostItem) => ({ displayName: item.display_name }),
    });
    const hidden = bindColumn(nameSpec, {
      getValue: (item: HostItem) => ({ displayName: item.display_name }),
      isShownByDefault: false,
    });

    expect(shown.isShown).toBe(true);
    expect(shown.isShownByDefault).toBe(true);
    expect(hidden.isShown).toBe(false);
    expect(hidden.isShownByDefault).toBe(false);
  });
});

const hostColumn: Column<HostItem> = bindColumn(nameSpec, {
  getValue: (item) => ({ displayName: item.display_name }),
});

export const boundHostColumns: Column<HostItem>[] = [hostColumn];

// @ts-expect-error PatchItem is not assignable as HostItem binding
export const invalidHostColumn: Column<HostItem> = bindColumn(nameSpec, {
  getValue: (item: PatchItem) => ({ displayName: item.hostname }),
});
