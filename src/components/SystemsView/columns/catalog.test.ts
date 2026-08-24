import { bindColumn } from './bindColumn';
import { columnCatalog } from './catalog';
import type { Column, ColumnSpec } from './types';

type HostItem = {
  id: string;
  display_name: string;
  groups: { name: string }[];
};
type PatchItem = { id: string; hostname: string };

const nameSpec: ColumnSpec<{ displayName: string }> = {
  key: 'display_name',
  title: 'Name',
  appName: 'inventory',
  renderCell: (value) => value.displayName,
};

describe('columnCatalog.custom', () => {
  it('is bindColumn', () => {
    expect(columnCatalog.custom).toBe(bindColumn);
  });

  it('binds an ad-hoc spec and can mix with named factories', () => {
    const columns: Column<HostItem>[] = [
      columnCatalog.workspace({
        getValue: (item) => item.groups,
      }),
      columnCatalog.custom(nameSpec, {
        getValue: (item) => ({ displayName: item.display_name }),
      }),
    ];

    expect(columns).toHaveLength(2);
    expect(columns[1].key).toBe('display_name');
    expect(
      columns[1].getValue({ id: '1', display_name: 'host-a', groups: [] }),
    ).toEqual({ displayName: 'host-a' });
    expect(columns[1].renderCell({ displayName: 'host-a' })).toBe('host-a');
  });
});

const hostColumn: Column<HostItem> = columnCatalog.custom(nameSpec, {
  getValue: (item) => ({ displayName: item.display_name }),
});

export const customHostColumns: Column<HostItem>[] = [hostColumn];

// @ts-expect-error PatchItem is not assignable as HostItem binding
export const invalidCustomColumn: Column<HostItem> = columnCatalog.custom(
  nameSpec,
  {
    getValue: (item: PatchItem) => ({ displayName: item.hostname }),
  },
);
