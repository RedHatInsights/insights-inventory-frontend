import { DataViewTrObject } from '@patternfly/react-data-view';
import React from 'react';
import SystemsViewRowActions from '../SystemsViewRowActions';
import { RenderableColumn } from './useColumns';
import { STICKY_NAME_BODY_PROPS } from '../stickyNameColumn';
import { getSystemsViewColumnMinWidthStyle } from '../columnMinWidths';
import { STICKY_ACTIONS_BODY_PROPS } from '../stickyActionsColumn';
import type { SystemWithPermissions } from '../../../Utilities/hooks/useHostIdsWithKessel';
import type { System } from './useSystemsQuery';

/** DataViewTrObject Extension, `meta` points to associated system objects. */
export type SystemsViewTableRow = DataViewTrObject & {
  meta: System | SystemWithPermissions;
};

interface UseRowsParams {
  data?: (System | SystemWithPermissions)[];
  renderableColumns: RenderableColumn[];
}

interface UseRowsReturnValue {
  rows: SystemsViewTableRow[];
}

export const useRows = ({
  data,
  renderableColumns,
}: UseRowsParams): UseRowsReturnValue => {
  const mapSystemToRow = (
    system: System | SystemWithPermissions,
  ): SystemsViewTableRow => {
    const selectableColumnCells = renderableColumns
      .filter((col) => col.isShown)
      .map((col) => {
        const cell = col.renderCell(system);
        if (col.key === 'name') {
          return { cell, props: STICKY_NAME_BODY_PROPS };
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
          props: {
            ...STICKY_ACTIONS_BODY_PROPS,
            isActionCell: true,
          },
        },
      ],
    };
  };
  const rows = (data ?? []).map(mapSystemToRow);

  return { rows };
};
