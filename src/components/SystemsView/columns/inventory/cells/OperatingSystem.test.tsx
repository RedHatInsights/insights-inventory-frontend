import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { SystemProfileOperatingSystem } from '@redhat-cloud-services/host-inventory-client';
import OperatingSystem from './OperatingSystem';
import { NOT_AVAILABLE } from '../../CellValue';

const rhelOs: SystemProfileOperatingSystem = {
  name: 'RHEL',
  major: 8,
  minor: 10,
};

const centosOs: SystemProfileOperatingSystem = {
  name: 'CentOS Linux',
  major: 7,
  minor: 4,
};

describe('OperatingSystem cell', () => {
  it('should show OS version for RHEL', () => {
    render(<OperatingSystem value={rhelOs} />);

    expect(screen.getByText('RHEL 8.10')).toBeInTheDocument();
  });

  it('should show OS version for CentOS Linux', () => {
    render(<OperatingSystem value={centosOs} />);

    expect(screen.getByText('CentOS Linux 7.4')).toBeInTheDocument();
  });

  it('should show OS name without version for other operating systems', () => {
    const centosStream = {
      name: 'CentOS Stream',
      major: 7,
      minor: 4,
    } as unknown as SystemProfileOperatingSystem;

    render(<OperatingSystem value={centosStream} />);

    expect(screen.getByText('CentOS Stream')).toBeInTheDocument();
  });

  it(`should show ${NOT_AVAILABLE} when operating system data is missing`, () => {
    render(<OperatingSystem value={undefined} />);

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });
});
