import type { SystemsViewExportConfig } from '../../components/SystemsView/export/types';
import type { SystemsViewItem } from '../../components/SystemsView/types';

/**
 * Fills in the inventory-backend default for an export config that omits
 * `onExport` — parity with the Gen 1 InventoryTable's `enableExport`, where a
 * consumer could opt into "export all systems through the inventory export
 * service" without writing any export logic.
 *
 * Resolution rules:
 * - `onExport` missing → the fallback's (inventory all-systems export)
 * - `itemTexts` missing → the fallback's "Export all systems …" labels, but
 * only when `onExport` was also omitted. A custom `onExport` instead keeps
 * the generic "Export to CSV/JSON" defaults, since its scope is unknown.
 *
 *  @param exportConfig The consumer-supplied config
 *  @param fallback     The inventory all-systems export config
 *  @returns            The resolved config
 */
export const resolveExportConfig = <TItem extends SystemsViewItem>(
  exportConfig: SystemsViewExportConfig<TItem>,
  fallback: SystemsViewExportConfig<TItem>,
): SystemsViewExportConfig<TItem> => {
  const resolved: SystemsViewExportConfig<TItem> = {
    ...exportConfig,
    onExport: exportConfig.onExport ?? fallback.onExport,
  };
  if (!exportConfig.onExport && !exportConfig.itemTexts) {
    resolved.itemTexts = fallback.itemTexts;
  }
  return resolved;
};
