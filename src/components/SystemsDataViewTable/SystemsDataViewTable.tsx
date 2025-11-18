import React from 'react';
import { DataView } from '@patternfly/react-data-view';
import {
  DataViewTable,
  DataViewTh,
  DataViewTr,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import { useDataViewSelection } from '@patternfly/react-data-view/dist/dynamic/Hooks';
import { Bullseye, Spinner, Tooltip } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { fetchSystems } from '../../routes/Systems/helpers.js';
import DisplayName from '../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import Workspace from '../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import Tags from '../../routes/Systems/components/SystemsTable/components/columns/Tags';
import OperatingSystem from '../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import LastSeen from '../../routes/Systems/components/SystemsTable/components/columns/LastSeen';

// TODO improve System interface types
interface System {
  id: string;
  display_name: string;
  groups?: Array<{ name?: string }>;
  tags?: Array<object>;
  system_profile?: {
    operating_system?: {
      name?: string;
      major?: number;
      minor?: number;
    };
    bootc_status?: unknown;
  };
  updated?: string;
  culled_timestamp?: string;
  stale_warning_timestamp?: string;
  stale_timestamp?: string;
  per_reporter_staleness?: {
    [reporter: string]: {
      stale_timestamp?: string | number | Date | null;
    } | null;
  } | null;
}

const SystemsDataViewTable: React.FC = () => {
  const selection = useDataViewSelection({
    matchOption: (a, b) => a.id === b.id,
  });

  const { data, isLoading } = useQuery<System[]>({
    queryKey: ['systems'],
    queryFn: async () => {
      const [systemsData] = await fetchSystems({});
      return systemsData;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading || !data) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  // Define columns
  const columns: DataViewTh[] = [
    'Name',
    'Workspace',
    'Tags',
    <Tooltip key="os-column" content={<span>Operating system</span>}>
      <span>OS</span>
    </Tooltip>,
    'Last seen',
  ];

  // Define rows
  const rows: DataViewTr[] = data.map((system) => ({
    id: system.id,
    row: [
      <DisplayName key={`name-${system.id}`} {...system} props={{}} />,
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
    ],
  }));

  return (
    <DataView selection={selection}>
      <DataViewTable
        aria-label="Systems table"
        variant="compact"
        ouiaId="systems-dataview-table"
        columns={columns}
        rows={rows}
      />
    </DataView>
  );
};

export default SystemsDataViewTable;
