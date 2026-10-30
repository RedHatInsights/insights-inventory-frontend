import { expect } from '@jest/globals';
import { buildExportConfiguration } from './buildExportConfiguration';
import type { Column } from '../columns/types';
import type { SystemsViewItem } from '../types';

const col = (
  key: string,
  isShown: boolean | undefined,
  isPermissionLocked?: boolean,
): Column<SystemsViewItem> =>
  ({
    key,
    isShown,
    isPermissionLocked,
    title: key,
    getValue: () => undefined,
    renderCell: () => null,
    isShownByDefault: true,
    appName: 'inventory',
  }) as unknown as Column<SystemsViewItem>;

describe('buildExportConfiguration', () => {
  it('includes only shown columns, in order', () => {
    const config = buildExportConfiguration({
      filters: {},
      columns: [
        col('display_name', true),
        col('tags', false),
        col('operating_system', true),
      ],
      sortBy: undefined,
      direction: undefined,
    });

    expect(config.columns).toEqual([
      { key: 'display_name' },
      { key: 'operating_system' },
    ]);
  });

  it('excludes shown columns that are permission-locked', () => {
    const config = buildExportConfiguration({
      filters: {},
      columns: [
        col('display_name', true),
        col('advisor:recommendations', true, true),
        col('operating_system', true),
      ],
      sortBy: undefined,
      direction: undefined,
    });

    expect(config.columns).toEqual([
      { key: 'display_name' },
      { key: 'operating_system' },
    ]);
  });

  it('includes sort when both key and a valid direction are present', () => {
    const config = buildExportConfiguration({
      filters: {},
      columns: [col('display_name', true)],
      sortBy: 'display_name',
      direction: 'desc',
    });

    expect(config.sort).toEqual({ key: 'display_name', direction: 'desc' });
  });

  it('omits sort when direction is missing', () => {
    const config = buildExportConfiguration({
      filters: {},
      columns: [col('display_name', true)],
      sortBy: 'display_name',
      direction: undefined,
    });

    expect(config.sort).toBeUndefined();
  });

  it('omits sort when sortBy is missing', () => {
    const config = buildExportConfiguration({
      filters: {},
      columns: [col('display_name', true)],
      sortBy: undefined,
      direction: 'asc',
    });

    expect(config.sort).toBeUndefined();
  });

  it('omits filters when no toolbar filters are active', () => {
    const config = buildExportConfiguration({
      filters: {},
      columns: [col('display_name', true)],
      sortBy: undefined,
      direction: undefined,
    });

    expect(config.filters).toBeUndefined();
  });

  it('includes filters built from active toolbar state', () => {
    const config = buildExportConfiguration({
      filters: { hostname_or_id: 'web-01' },
      columns: [col('display_name', true)],
      sortBy: undefined,
      direction: undefined,
    });

    expect(config.filters).toEqual({ host: { hostname_or_id: 'web-01' } });
  });
});
