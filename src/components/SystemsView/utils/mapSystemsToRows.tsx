import { DataViewTrObject } from '@patternfly/react-data-view';
import React from 'react';
import SystemsViewRowActions from '../SystemsViewRowActions';
import {
  getColumnMinWidthStyle,
  getNameColumnMinWidth,
} from './columnMinWidths';
import { STICKY_ACTIONS_BODY_PROPS } from './stickyActionsColumn';
import { getStickyNameBodyProps } from './stickyNameColumn';
import type { System } from '../../InventoryViews/hostsQueryOptions';
import { Column } from '../columns/allColumnDefinitions';
import type { SystemsViewItem } from '../types';

/** DataViewTrObject Extension, `meta` points to associated system objects. */
export type SystemsViewTableRow<TItem extends SystemsViewItem> =
  DataViewTrObject & {
    meta: TItem;
  };

interface MapSystemsToRowsParams<TItem extends SystemsViewItem> {
  data?: TItem[];
  columns: readonly Column[];
  /**
   * When true (inventory views feature): sticky Name/actions cells and column min-widths.
   */
  isInventoryViewsEnabled: boolean;
}

export const mapSystemsToRows = <TItem extends SystemsViewItem>({
  data,
  columns,
  isInventoryViewsEnabled,
}: MapSystemsToRowsParams<TItem>): SystemsViewTableRow<TItem>[] => {
  const mapSystemToRow = (system: TItem): SystemsViewTableRow<TItem> => {
    const selectableColumnCells = columns
      .filter((col) => col.isShown)
      .map((col) => {
        // FIXME remove type casting
        const cell = col.renderCell(system as unknown as System);
        if (col.key === 'display_name') {
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
          // FIXME remove type casting
          cell: <SystemsViewRowActions system={system as unknown as System} />,
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
