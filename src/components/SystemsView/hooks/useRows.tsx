import { DataViewTrObject } from '@patternfly/react-data-view';
import { System } from './useSystemsQuery';
import DisplayName from '../../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import Workspace from '../../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import OperatingSystem from '../../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import LastSeen from '../../../routes/Systems/components/SystemsTable/components/columns/LastSeen';
import React from 'react';
import Tags from '../../../routes/Systems/components/SystemsTable/components/columns/Tags';
import SystemsViewRowActions from '../SystemsViewRowActions';

interface UseRowsParams {
  data?: System[];
}

interface UseRowsReturnValue {
  rows: DataViewTrObject[];
}

export const useRows = ({ data }: UseRowsParams): UseRowsReturnValue => {
  const mapSystemToRow = (system: System): DataViewTrObject => {
    return {
      id: system.id,
      row: [
        <DisplayName
          key={`name-${system.id}`}
          id={system.id}
          props={{}}
          {...system}
        />,
        <Workspace key={`workspace-${system.id}`} groups={system.groups} />,
        <Tags
          key={`tags-${system.id}`}
          tags={system.tags}
          systemId={system.id}
        />,
        <OperatingSystem
          key={`os-${system.id}`}
          system_profile={system.system_profile}
        />,
        <LastSeen
          key={`lastseen-${system.id}`}
          updated={system.updated}
          culled_timestamp={system?.culled_timestamp}
          stale_warning_timestamp={system?.stale_warning_timestamp}
          stale_timestamp={system?.stale_timestamp}
          per_reporter_staleness={system?.per_reporter_staleness}
        />,
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
