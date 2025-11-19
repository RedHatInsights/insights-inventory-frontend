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
import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import DisplayName from '../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import Workspace from '../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import Tags from '../../routes/Systems/components/SystemsTable/components/columns/Tags';
import OperatingSystem from '../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import LastSeen from '../../routes/Systems/components/SystemsTable/components/columns/LastSeen';
import { getHostList, getHostTags } from '../../api/hostInventoryApiTyped';

// TODO reimplement and pass a real state
const fetchSystems = async (state = { filters: { filter: {} } }) => {
  const fields = {
    system_profile: [
      'operating_system',
      'system_update_method' /* needed by inventory groups Why? */,
      'bootc_status',
    ],
  };

  const { filter, ...filterParams } = state?.filters || {};

  const params = {
    ...filterParams,
    tags: [],
    options: {
      params: {
        // There is a bug in the JS clients that requires us to pass "filter" and "fields" as "raw" params.
        // the issue is that JS clients convert that object wrongly to something like filter.systems_profile.sap_system as the param name
        // it should rather be something like `filter[systems_profile][sap_system]`
        ...generateFilter(fields, 'fields'),
        ...generateFilter(filter),
      },
    },
  };

  const { results: hosts } = await getHostList(params);
  const { results: hostsTags = {} } = await getHostTags({
    hostIdList: hosts
      .map(({ id }) => id)
      .filter((id): id is string => id !== undefined),
  });

  const systems = hosts.map((host) => ({
    ...host,
    ...(host.id && hostsTags[host.id] ? { tags: hostsTags[host.id] } : {}),
  }));

  return systems;
};

const SystemsDataViewTable: React.FC = () => {
  const selection = useDataViewSelection({
    matchOption: (a, b) => a.id === b.id,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: async () => {
      const systemsData = await fetchSystems();
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
    // FIXME types in column components
    row: [
      <DisplayName key={`name-${system.id}`} id={system.id} props={{}} />,
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
