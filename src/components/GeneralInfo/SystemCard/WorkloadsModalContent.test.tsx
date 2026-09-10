import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import type {
  SystemProfileAnsible,
  SystemProfileWorkloadsSatellite,
} from '@redhat-cloud-services/host-inventory-client';
import {
  AnsibleWorkloadsContent,
  SatelliteWorkloadsContent,
  type WorkloadsEntity,
} from './WorkloadsModalContent';

const ansible: SystemProfileAnsible = {
  controller_version: '2.40',
  hub_version: '2.4.0',
  receptor_version: '1.4.1',
  containers: [
    {
      name: 'automation-controller',
      image: 'registry.redhat.io/ansible-automation-platform/controller:2.4',
      state: 'running',
    },
  ],
};

const satellite: SystemProfileWorkloadsSatellite = {
  type: 'server',
  version: '6.19.0',
  foremanctl_version: '1.1.0',
  containers: [
    {
      name: 'satellite',
      image: 'registry.redhat.io/satellite/satellite-rhel9:6.16.0',
      state: 'running',
    },
  ],
};

const entity: WorkloadsEntity = {
  per_reporter_staleness: {
    puptoo: { last_check_in: '2024-02-19T09:19:00.000Z' },
    'yupana-canary': { last_check_in: '2024-02-20T09:19:00.000Z' },
  },
};

const getRowValue = (label: string) =>
  screen.getByRole('definition', { name: `${label} value` }).textContent;

describe('AnsibleWorkloadsContent', () => {
  it('shows the most recent check-in across reporters as "Last seen"', () => {
    render(<AnsibleWorkloadsContent ansible={ansible} entity={entity} />);

    expect(getRowValue('Last seen')).toMatch(/20 Feb 2024/);
  });

  it('falls back when no reporter has checked in', () => {
    render(<AnsibleWorkloadsContent ansible={ansible} entity={{}} />);

    expect(getRowValue('Last seen')).toContain('Not available');
  });

  it('renders reported RPM versions and placeholders for the rest', () => {
    render(<AnsibleWorkloadsContent ansible={ansible} entity={entity} />);

    expect(getRowValue('Controller RPM')).toContain('2.40');
    expect(getRowValue('Hub RPM')).toContain('2.4.0');
    expect(getRowValue('Receptor RPM')).toContain('1.4.1');
    // Not reported by this system
    expect(getRowValue('Runner RPM')).toContain('--');
    expect(getRowValue('Gateway RPM')).toContain('--');
  });

  it('renders the containers table', () => {
    render(<AnsibleWorkloadsContent ansible={ansible} entity={entity} />);

    const table = screen.getByRole('grid', {
      name: 'Containerized Ansible workloads',
    });
    expect(
      within(table).getByRole('columnheader', { name: 'Name' }),
    ).toBeVisible();
    expect(within(table).getByText('automation-controller')).toBeVisible();
    expect(within(table).getByText('Running')).toBeVisible();
  });

  it('omits the containers section when none are reported', () => {
    render(
      <AnsibleWorkloadsContent
        ansible={{ controller_version: '2.40' }}
        entity={entity}
      />,
    );

    expect(
      screen.queryByText('Containerized Ansible workloads'),
    ).not.toBeInTheDocument();
  });

  it('omits the RPM section when no version is reported', () => {
    render(
      <AnsibleWorkloadsContent
        ansible={{ containers: ansible.containers }}
        entity={entity}
      />,
    );

    expect(screen.queryByText('RPM package versions')).not.toBeInTheDocument();
  });

  it('renders without workload data', () => {
    render(<AnsibleWorkloadsContent />);

    expect(getRowValue('Last seen')).toContain('Not available');
    expect(screen.queryByText('RPM package versions')).not.toBeInTheDocument();
  });
});

describe('SatelliteWorkloadsContent', () => {
  it('renders the capitalized server type', () => {
    render(<SatelliteWorkloadsContent satellite={satellite} />);

    expect(getRowValue('Type')).toContain('Server');
  });

  it('falls back when no reporter has checked in', () => {
    render(<SatelliteWorkloadsContent satellite={satellite} entity={{}} />);

    expect(getRowValue('Last seen')).toContain('Not available');
  });

  it('renders the capitalized capsule type', () => {
    render(<SatelliteWorkloadsContent satellite={{ type: 'capsule' }} />);

    expect(getRowValue('Type')).toContain('Capsule');
  });

  it('renders RPM versions', () => {
    render(<SatelliteWorkloadsContent satellite={satellite} />);

    expect(getRowValue('Satellite RPM')).toContain('6.19.0');
    expect(getRowValue('foremanctl RPM')).toContain('1.1.0');
  });

  it('renders the containers table', () => {
    render(<SatelliteWorkloadsContent satellite={satellite} />);

    const table = screen.getByRole('grid', {
      name: 'Containerized Satellite workloads',
    });
    expect(within(table).getByText('satellite')).toBeVisible();
    expect(
      within(table).getByText(
        'registry.redhat.io/satellite/satellite-rhel9:6.16.0',
      ),
    ).toBeVisible();
    expect(within(table).getByText('Running')).toBeVisible();
  });

  it('keeps the RPM section when only one version is reported', () => {
    render(<SatelliteWorkloadsContent satellite={{ version: '6.19.0' }} />);

    expect(getRowValue('Satellite RPM')).toContain('6.19.0');
    expect(getRowValue('foremanctl RPM')).toContain('--');
  });

  it('renders without workload data', () => {
    render(<SatelliteWorkloadsContent />);

    expect(getRowValue('Type')).toContain('--');
    expect(screen.queryByText('RPM package versions')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Containerized Satellite workloads'),
    ).not.toBeInTheDocument();
  });
});
