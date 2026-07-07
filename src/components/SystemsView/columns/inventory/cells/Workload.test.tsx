import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Workload from './Workload';
import { NOT_AVAILABLE } from '../../CellValue';
import type { InventoryViewSystem } from '../../../hooks/useInventoryViewsQuery';

const SYSTEM_ID = 'test-system-id';

const systemWithWorkloads = {
  id: SYSTEM_ID,
  system_profile: {
    workloads: {
      sap: { sids: ['PRD'] },
      ansible: { controller_version: '4.0' },
    },
  },
} as unknown as InventoryViewSystem;

const systemWithEmptyWorkloads = {
  id: SYSTEM_ID,
  system_profile: {
    workloads: {},
  },
} as unknown as InventoryViewSystem;

const systemWithoutWorkloads = {
  id: SYSTEM_ID,
  system_profile: {},
} as unknown as InventoryViewSystem;

describe('Workload cell', () => {
  it('should show comma-separated workload acronyms for present keys', () => {
    render(<Workload system={systemWithWorkloads} />);

    expect(screen.getByText('AAP, SAP')).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when no workloads are present`, () => {
    const { rerender } = render(<Workload system={systemWithEmptyWorkloads} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(<Workload system={systemWithoutWorkloads} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
