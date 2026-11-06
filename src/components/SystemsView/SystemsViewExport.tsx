import React, { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ExportIcon } from '@patternfly/react-icons';
import { useNotifications } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import type {
  ExportFormat,
  SystemsViewExportConfig,
  SystemsViewExportState,
} from './export/types';
import type { SystemsViewItem } from './types';

// Generic default labels. Consumers exporting all systems regardless of
// filters (e.g. InventoryHosts) override these with "Export all systems …"
// to keep the legacy wording honest about the export's scope.
const DEFAULT_ITEM_TEXTS = {
  csv: 'Export to CSV',
  json: 'Export to JSON',
} as const;

// Every toast stage removes the previous one so stage transitions and
// repeated exports replace (rather than stack) notifications. The
// notifications store always generates fresh ids, so previous toasts are
// matched by title instead.
const EXPORT_TOAST_TITLES = [
  'Preparing export',
  'Downloading export',
  'Couldn’t download export',
] as const;

interface SystemsViewExportProps<TItem extends SystemsViewItem> {
  exportConfig: SystemsViewExportConfig<TItem>;
  exportState: SystemsViewExportState<TItem>;
}

/**
 * The export menu for SystemsView. Rendered only when the host provides an
 * export config. Owns the toast lifecycle around the consumer's `onExport`
 * so every export mechanism (export service or client-side) gets the same
 * preparing → downloaded / failed experience.
 */
export const SystemsViewExport = <TItem extends SystemsViewItem>({
  exportConfig,
  exportState,
}: SystemsViewExportProps<TItem>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { addNotification, removeNotification, notifications } =
    useNotifications();

  const itemTexts = { ...DEFAULT_ITEM_TEXTS, ...exportConfig.itemTexts };
  const isDisabledByConfig =
    typeof exportConfig.isDisabled === 'function'
      ? exportConfig.isDisabled(exportState)
      : exportConfig.isDisabled;
  const isDisabled = isDisabledByConfig || isExporting;

  const replaceExportToasts = (
    config: Parameters<typeof addNotification>[0],
  ) => {
    notifications
      .filter((notification) =>
        (EXPORT_TOAST_TITLES as readonly string[]).includes(
          String(notification.title),
        ),
      )
      .forEach((notification) => removeNotification(notification.id));
    addNotification(config);
  };

  const onSelect = async (_event: unknown, format?: ExportFormat) => {
    setIsOpen(false);
    // The federated module resolves a missing onExport to the inventory
    // all-systems export; this guard covers direct users of the raw
    // component that pass a config without one.
    if (!format || isDisabled || !exportConfig.onExport) {
      return;
    }

    setIsExporting(true);
    replaceExportToasts({
      variant: 'info',
      title: 'Preparing export',
      description: 'Once complete, your download will start automatically.',
    });
    try {
      await exportConfig.onExport(format, exportState);
      replaceExportToasts({
        variant: 'success',
        title: 'Downloading export',
      });
    } catch {
      replaceExportToasts({
        variant: 'danger',
        title: 'Couldn’t download export',
        description: 'Reinitiate this export to try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ToolbarGroup variant="action-group-plain">
      <ToolbarItem>
        <Dropdown
          onSelect={onSelect}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              aria-label="Export"
              ouiaId="Export"
              variant="plain"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
              icon={<ExportIcon />}
            />
          )}
          isOpen={isOpen}
          onOpenChange={(isOpen) => setIsOpen(isOpen)}
        >
          <DropdownList>
            <DropdownItem value="csv" isDisabled={isDisabled}>
              {itemTexts.csv}
            </DropdownItem>
            <DropdownItem value="json" isDisabled={isDisabled}>
              {itemTexts.json}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );
};
