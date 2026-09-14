import React, { useMemo, useState } from 'react';
import {
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  SortByDirection,
  breakWord,
  cellWidth,
  nowrap,
  sortable,
} from '@patternfly/react-table';
import type { ICell } from '@patternfly/react-table';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import type {
  HostOut,
  SystemProfileAnsible,
  SystemProfileContainer,
  SystemProfileWorkloadsSatellite,
} from '@redhat-cloud-services/host-inventory-client';
import UntypedInfoTable from '../InfoTable';

interface InfoTableProps {
  cells: ICell[];
  rows: React.ReactNode[][];
  filters?: Array<{ index?: number; type?: string }>;
  onSort?: (
    event: React.MouseEvent,
    index: number,
    direction: SortByDirection,
  ) => void;
}

/** `InfoTable` is untyped JS */
const InfoTable = UntypedInfoTable as unknown as (
  props: InfoTableProps,
) => React.JSX.Element;

const NOT_AVAILABLE = '--';

interface RpmField {
  label: string;
  value?: string;
}

export type WorkloadsEntity = Pick<HostOut, 'per_reporter_staleness'>;

const ansibleRpmFields = (ansible?: SystemProfileAnsible): RpmField[] => [
  { label: 'Controller RPM', value: ansible?.controller_version },
  { label: 'Hub RPM', value: ansible?.hub_version },
  { label: 'Receptor RPM', value: ansible?.receptor_version },
  { label: 'Runner RPM', value: ansible?.runner_version },
  { label: 'Catalog worker RPM', value: ansible?.catalog_worker_version },
  { label: 'SSO RPM', value: ansible?.sso_version },
  { label: 'EDA controller RPM', value: ansible?.eda_controller_version },
  { label: 'Gateway RPM', value: ansible?.gateway_version },
];

const satelliteRpmFields = (
  satellite?: SystemProfileWorkloadsSatellite,
): RpmField[] => [
  { label: 'Satellite RPM', value: satellite?.version },
  { label: 'foremanctl RPM', value: satellite?.foremanctl_version },
];

const capitalize = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : undefined;

/**
 * Most recent check-in across all reporters - the same value the
 * System status card shows as "Last seen".
 *  @param entity - Host entity
 *  @returns      ISO timestamp, or undefined when no reporter has checked in
 */
const getLastCheckIn = (entity?: WorkloadsEntity): string | undefined =>
  Object.values(entity?.per_reporter_staleness ?? {})
    .map((reporter) => reporter.last_check_in)
    .filter((checkIn): checkIn is string => Boolean(checkIn))
    .sort()
    .reverse()[0];

const DescriptionRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <DescriptionListGroup>
    <DescriptionListTerm>{label}</DescriptionListTerm>
    <DescriptionListDescription aria-label={`${label} value`}>
      {children}
    </DescriptionListDescription>
  </DescriptionListGroup>
);

const SummarySection = ({
  items,
}: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) => (
  <StackItem>
    <DescriptionList columnModifier={{ default: '2Col' }}>
      {items.map(({ label, value }) => (
        <DescriptionRow key={label} label={label}>
          {value}
        </DescriptionRow>
      ))}
    </DescriptionList>
  </StackItem>
);

const lastSeenValue = (entity?: WorkloadsEntity): React.ReactNode => {
  const lastCheckIn = getLastCheckIn(entity);
  return lastCheckIn ? (
    <DateFormat date={lastCheckIn} type="exact" />
  ) : (
    'Not available'
  );
};

const RpmVersionsSection = ({ fields }: { fields: RpmField[] }) => {
  if (!fields.some(({ value }) => value)) {
    return null;
  }

  return (
    <StackItem>
      <Content component={ContentVariants.h3}>RPM package versions</Content>
      <DescriptionList columnModifier={{ default: '2Col' }}>
        {fields.map(({ label, value }) => (
          <DescriptionRow key={label} label={label}>
            {value || NOT_AVAILABLE}
          </DescriptionRow>
        ))}
      </DescriptionList>
    </StackItem>
  );
};

const containerCells = [
  { title: 'Name', transforms: [sortable] },
  { title: 'Image', transforms: [sortable], cellTransforms: [breakWord] },
  { title: 'State', transforms: [sortable, cellWidth(15), nowrap] },
];

const containerFilters = [{ type: 'text' }];

const ContainersSection = ({
  title,
  containers = [],
}: {
  title: string;
  containers?: SystemProfileContainer[];
}) => {
  const [sortBy, setSortBy] = useState({
    index: 0,
    direction: SortByDirection.asc,
  });

  const rows = useMemo(() => {
    const sorted = containers
      .map(({ name, image, state }) => [
        name || NOT_AVAILABLE,
        image || NOT_AVAILABLE,
        capitalize(state) || NOT_AVAILABLE,
      ])
      .sort((a, b) =>
        a[sortBy.index].localeCompare(b[sortBy.index], undefined, {
          sensitivity: 'base',
        }),
      );

    return sortBy.direction === SortByDirection.asc ? sorted : sorted.reverse();
  }, [containers, sortBy]);

  if (containers.length === 0) {
    return null;
  }

  return (
    <StackItem>
      <Content component={ContentVariants.h3}>{title}</Content>
      <InfoTable
        cells={containerCells}
        rows={rows}
        filters={containerFilters}
        onSort={(_event, index, direction) => setSortBy({ index, direction })}
      />
    </StackItem>
  );
};

export interface AnsibleWorkloadsContentProps {
  ansible?: SystemProfileAnsible;
  entity?: WorkloadsEntity;
}

export const AnsibleWorkloadsContent = ({
  ansible,
  entity,
}: AnsibleWorkloadsContentProps) => (
  <Stack hasGutter>
    <SummarySection
      items={[{ label: 'Last seen', value: lastSeenValue(entity) }]}
    />
    <RpmVersionsSection fields={ansibleRpmFields(ansible)} />
    <ContainersSection
      title="Containerized Ansible workloads"
      containers={ansible?.containers}
    />
  </Stack>
);

export interface SatelliteWorkloadsContentProps {
  satellite?: SystemProfileWorkloadsSatellite;
  entity?: WorkloadsEntity;
}

export const SatelliteWorkloadsContent = ({
  satellite,
  entity,
}: SatelliteWorkloadsContentProps) => (
  <Stack hasGutter>
    <SummarySection
      items={[
        { label: 'Type', value: capitalize(satellite?.type) || NOT_AVAILABLE },
        { label: 'Last seen', value: lastSeenValue(entity) },
      ]}
    />
    <RpmVersionsSection fields={satelliteRpmFields(satellite)} />
    <ContainersSection
      title="Containerized Satellite workloads"
      containers={satellite?.containers}
    />
  </Stack>
);
