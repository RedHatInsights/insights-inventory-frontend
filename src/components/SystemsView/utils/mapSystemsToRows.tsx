import { DataViewTrObject } from '@patternfly/react-data-view';
import React from 'react';
import SystemsViewRowActions from '../SystemsViewRowActions';
import {
  getColumnMinWidthStyle,
  getNameColumnMinWidth,
} from './columnMinWidths';
import { STICKY_ACTIONS_BODY_PROPS } from './stickyActionsColumn';
import { getStickyNameBodyProps } from './stickyNameColumn';
import type { SystemWithPermissions } from '../../../Utilities/hooks/useHostIdsWithKessel';
import type { System } from '../hooks/useSystemsQuery';
import { Column } from '../columns/allColumnDefinitions';

/** DataViewTrObject Extension, `meta` points to associated system objects. */
export type SystemsViewTableRow = DataViewTrObject & {
  meta: System | SystemWithPermissions;
};

interface MapSystemsToRowsParams {
  data?: (System | SystemWithPermissions)[];
  columns: readonly Column[];
  /**
   * When true (inventory views feature): sticky Name/actions cells and column min-widths.
   */
  isInventoryViewsEnabled: boolean;
}

export const mapSystemsToRows = ({
  data,
  columns,
  isInventoryViewsEnabled,
}: MapSystemsToRowsParams): SystemsViewTableRow[] => {
  const mapSystemToRow = (
    system: System | SystemWithPermissions,
  ): SystemsViewTableRow => {
    const selectableColumnCells = columns
      .filter((col) => col.isShown)
      .map((col) => {
        const cell = col.renderCell(system);
        if (col.key === 'name') {
          if (isInventoryViewsEnabled) {
            return {
              cell,
              props: getStickyNameBodyProps(getNameColumnMinWidth(col)),
            };
          }
          return cell;
        }
        if (!isInventoryViewsEnabled) {
          return cell;
        }
        const minStyle = getColumnMinWidthStyle(col);
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

  return (data ?? []).map(mapSystemToRow);
};
