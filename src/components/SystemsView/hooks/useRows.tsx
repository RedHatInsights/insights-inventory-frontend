import { DataViewTrObject } from '@patternfly/react-data-view';
import { System } from './useSystemsQuery';
import React from 'react';
import SystemsViewRowActions from '../SystemsViewRowActions';
import { RenderableColumn } from './useColumns';

interface UseRowsParams {
  data?: System[];
  renderableColumns: RenderableColumn[];
}

interface UseRowsReturnValue {
  rows: DataViewTrObject[];
}

export const useRows = ({
  data,
  renderableColumns,
}: UseRowsParams): UseRowsReturnValue => {
  const mapSystemToRow = (system: System): DataViewTrObject => {
    const selectableColumnCells = renderableColumns
      .filter((col) => col.isShown)
      .map((col) => col.renderCell(system));

    return {
      id: system.id,
      row: [
        ...selectableColumnCells,
        {
          cell: <SystemsViewRowActions system={system} />,
          props: { isActionCell: true },
        },
      ],
    };
  };
  const rows = (data ?? []).map(mapSystemToRow);

  return { rows };
};
