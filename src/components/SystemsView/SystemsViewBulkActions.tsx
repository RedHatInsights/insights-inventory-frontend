import React, { Fragment } from 'react';
import {
  ResponsiveAction,
  ResponsiveActions,
} from '@patternfly/react-component-groups';
import { SystemsViewExport } from './SystemsViewExport';
import { useColumnManagementModalContext } from './ColumnManagementModalContext';
import useInventoryViewsFeatureFlag from '../../Utilities/useInventoryViewsFeatureFlag';
import type { ActionHelpers, BulkAction } from './actions/types';
import type { SystemsViewActiveState } from './utils/deriveActiveState';
import type { ViewConfiguration } from '../../api/inventoryViewsApi';

interface SystemsViewBulkActionsProps<TItem> {
  selectedSystems: TItem[];
  activeState: SystemsViewActiveState;
  bulkActions: readonly BulkAction<TItem>[];
  actionHelpers: ActionHelpers;
  /** Inventory-owned tables keep Manage columns. Module consumers pass false. */
  showColumnManagement?: boolean;
  exportConfiguration?: ViewConfiguration;
}

export const SystemsViewBulkActions = <TItem,>({
  selectedSystems,
  activeState,
  bulkActions,
  actionHelpers,
  showColumnManagement = true,
  exportConfiguration,
}: SystemsViewBulkActionsProps<TItem>) => {
  const isInventoryViewsEnabled = useInventoryViewsFeatureFlag();
  const { openColumnManagementModal } = useColumnManagementModalContext();

  return (
    <Fragment>
      <SystemsViewExport configuration={exportConfiguration} />
      <ResponsiveActions ouiaId="systems-view-toolbar-actions">
        {bulkActions.map((action) => {
          const tooltip = action.tooltip?.(selectedSystems);
          const isActionDisabled =
            activeState !== 'active' ||
            (action.isDisabled?.(selectedSystems) ?? false);

          return (
            <ResponsiveAction
              key={action.id}
              isPersistent={action.isPersistent}
              ouiaId={action.ouiaId}
              isDanger={action.isDanger}
              variant={action.variant}
              isDisabled={isActionDisabled}
              isAriaDisabled={Boolean(isActionDisabled && tooltip)}
              onClick={() => action.onAction(selectedSystems, actionHelpers)}
            >
              {action.label}
            </ResponsiveAction>
          );
        })}
        {showColumnManagement && isInventoryViewsEnabled && (
          <ResponsiveAction onClick={() => openColumnManagementModal()}>
            Manage columns
          </ResponsiveAction>
        )}
      </ResponsiveActions>
    </Fragment>
  );
};
