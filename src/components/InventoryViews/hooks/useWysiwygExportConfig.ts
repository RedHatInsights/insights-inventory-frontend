import { useMemo } from 'react';
import type { SystemsViewExportConfig } from '../../SystemsView/export/types';
import type { SystemsViewItem } from '../../SystemsView/types';
import { useInventoryExportRequest } from '../../../services/exportService/useInventoryExportRequest';
import { buildExportConfiguration } from '../utils/buildExportConfiguration';

/**
 * WYSIWYG export config for the inventory systems table.
 *
 * Serializes the live table state (filters, columns, sort) into a
 * ViewConfiguration and lets the export service replay it across all pages —
 * what you see is what you export. With no filters applied this exports all
 * systems, matching the table's behavior from before the export became
 * configurable.
 *
 * Pass the result to `<SystemsView exportConfig>`; the export menu owns the
 * toast lifecycle around `onExport`.
 */
export const useWysiwygExportConfig = <TItem extends SystemsViewItem>() => {
  const requestExport = useInventoryExportRequest();

  return useMemo<SystemsViewExportConfig<TItem>>(
    () => ({
      onExport: (format, state) =>
        requestExport(format, {
          configuration: buildExportConfiguration(state),
        }),
      // The export follows the live filters, so zero matching rows means
      // there is nothing to export — disable the menu rather than send the
      // backend a request it can only fail.
      isDisabled: (state) => state.total === 0,
    }),
    [requestExport],
  );
};
