import { useMemo } from 'react';
import type { SystemsViewExportConfig } from '../../components/SystemsView/export/types';
import type { SystemsViewItem } from '../../components/SystemsView/types';
import { useInventoryExportRequest } from './useInventoryExportRequest';

const ALL_SYSTEMS_ITEM_TEXTS = {
  csv: 'Export all systems to CSV',
  json: 'Export all systems to JSON',
} as const;

/**
 * Export config for the stable systems table (InventoryHosts): keeps the
 * original/legacy interaction — exports ALL systems regardless of the
 * table's filters or sorting, with the legacy export field set. The labels
 * say so explicitly.
 *
 * The WYSIWYG export of the current view lives in `useWysiwygExportConfig`,
 * used by InventoryViews.
 */
export const useAllSystemsExportConfig = <TItem extends SystemsViewItem>() => {
  const requestExport = useInventoryExportRequest();

  return useMemo<SystemsViewExportConfig<TItem>>(
    () => ({
      // Empty filters = the legacy request: the backend exports every system
      // in the org, ignoring the table state entirely.
      onExport: (format) => requestExport(format, {}),
      itemTexts: ALL_SYSTEMS_ITEM_TEXTS,
    }),
    [requestExport],
  );
};
