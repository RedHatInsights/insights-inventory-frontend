import { expect, jest } from '@jest/globals';
import type { SystemsViewExportConfig } from '../../components/SystemsView/export/types';
import type { SystemsViewItem } from '../../components/SystemsView/types';
import { resolveExportConfig } from './resolveExportConfig';

const onExport = jest.fn(async () => {});
const fallbackOnExport = jest.fn(async () => {});

const fallback: SystemsViewExportConfig<SystemsViewItem> = {
  onExport: fallbackOnExport,
  itemTexts: {
    csv: 'Export all systems to CSV',
    json: 'Export all systems to JSON',
  },
};

describe('resolveExportConfig', () => {
  it('fills in the inventory export and labels when onExport is omitted', () => {
    const resolved = resolveExportConfig({}, fallback);

    expect(resolved.onExport).toBe(fallbackOnExport);
    expect(resolved.itemTexts).toBe(fallback.itemTexts);
  });

  it('fills in the inventory export but keeps custom labels', () => {
    const resolved = resolveExportConfig(
      { itemTexts: { csv: 'My CSV label' } },
      fallback,
    );

    expect(resolved.onExport).toBe(fallbackOnExport);
    expect(resolved.itemTexts).toEqual({ csv: 'My CSV label' });
  });

  it('keeps a custom onExport and uses the generic default labels', () => {
    const resolved = resolveExportConfig({ onExport }, fallback);

    expect(resolved.onExport).toBe(onExport);
    expect(resolved.itemTexts).toBeUndefined();
  });

  it('keeps a fully custom config untouched', () => {
    const config: SystemsViewExportConfig<SystemsViewItem> = {
      onExport,
      isDisabled: true,
      itemTexts: { csv: 'Custom' },
    };

    expect(resolveExportConfig(config, fallback)).toEqual(config);
  });
});
