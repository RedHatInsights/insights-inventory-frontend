import { DataViewTrObject } from '@patternfly/react-data-view';
import React from 'react';
import SystemsViewRowActions from '../SystemsViewRowActions';
import { RenderableColumn } from './useColumns';
import { getSystemsViewColumnMinWidthStyle } from '../utils/columnMinWidths';
import { STICKY_ACTIONS_BODY_PROPS } from '../utils/stickyActionsColumn';
import { STICKY_NAME_BODY_PROPS } from '../utils/stickyNameColumn';
import type { SystemWithPermissions } from '../../../Utilities/hooks/useHostIdsWithKessel';
import type { System } from './useSystemsQuery';

/** DataViewTrObject Extension, `meta` points to associated system objects. */
export type SystemsViewTableRow = DataViewTrObject & {
  meta: System | SystemWithPermissions;
};

interface UseRowsParams {
  data?: (System | SystemWithPermissions)[];
  columns: RenderableColumn[];
  /**
   * When true (inventory views feature): sticky Name/actions cells and column min-widths.
   */
  isInventoryViewsEnabled: boolean;
}

interface UseRowsReturnValue {
  rows: SystemsViewTableRow[];
}

export const useRows = ({
  data,
  columns,
  isInventoryViewsEnabled,
}: UseRowsParams): UseRowsReturnValue => {
  const mapSystemToRow = (
    system: System | SystemWithPermissions,
  ): SystemsViewTableRow => {
    const selectableColumnCells = columns
      .filter((col) => col.isShown)
      .map((col) => {
        const cell = col.renderCell(system);
        if (col.key === 'name') {
          if (isInventoryViewsEnabled) {
            return { cell, props: STICKY_NAME_BODY_PROPS };
          }
          return cell;
        }
        if (!isInventoryViewsEnabled) {
          return cell;
        }
        const minStyle = getSystemsViewColumnMinWidthStyle(col.key);
        return minStyle ? { cell, props: minStyle } : cell;
      });

    return {
      id: system.id,
      meta: system,
      row: [
        ...selectableColumnCells,
        {
          cell: <SystemsViewRowActions system={system} />,
          props: isInventoryViewsEnabled
            ? {
                ...STICKY_ACTIONS_BODY_PROPS,
                isActionCell: true,
              }
            : { isActionCell: true },
        },
      ],
    };
  };
  const rows = (data ?? []).map(mapSystemToRow);

  return { rows };
};
