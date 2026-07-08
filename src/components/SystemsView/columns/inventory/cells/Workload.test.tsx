import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { SystemProfileWorkloads } from '@redhat-cloud-services/host-inventory-client';
import Workload from './Workload';
import { NOT_AVAILABLE } from '../../CellValue';

const workloadsWithValues: SystemProfileWorkloads = {
  sap: { sids: new Set(['PRD']) },
  ansible: { controller_version: '4.0' },
};

describe('Workload cell', () => {
  it('should show comma-separated workload acronyms for present keys', () => {
    render(<Workload value={workloadsWithValues} />);

    expect(screen.getByText('AAP, SAP')).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when no workloads are present`, () => {
    const { rerender } = render(<Workload value={{}} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Workload value={undefined} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
