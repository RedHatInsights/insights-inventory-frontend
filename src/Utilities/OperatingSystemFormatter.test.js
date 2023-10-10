import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import OperatingSystemFormatter from './OperatingSystemFormatter';

describe('OperatingSystemFormatter', () => {
  let operatingSystem;

  it('should render correctly with RHEL and version', () => {
    operatingSystem = {
      name: 'RHEL',
      major: 7,
      minor: 4,
    };

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'RHEL 7.4'
    );
  });

  it('should render correctly with Centos and version', () => {
    operatingSystem = {
      name: 'CentOS Linux',
      major: 7,
      minor: 4,
    };

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'CentOS Linux 7.4'
    );
  });

  it('should render correctly with RHEL and no version', () => {
    operatingSystem = {
      name: 'RHEL',
      major: 7,
      minor: null,
    };

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'RHEL'
    );
  });

  it('should render correctly with RHEL and minor version set to 0', () => {
    operatingSystem = {
      name: 'RHEL',
      major: 7,
      minor: 0,
    };

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'RHEL 7.0'
    );
  });

  it('should render with different system', () => {
    operatingSystem = {
      name: 'Windows',
    };

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'Windows'
    );
  });

  it('should not render OS major minor version with different CentOS type system', () => {
    operatingSystem = {
      name: 'CentOS Stream',
      major: 7,
      minor: 4,
    };

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'CentOS Stream'
    );
  });

  it('missing name', () => {
    operatingSystem = {
      name: null,
    };

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'Not available'
    );
  });

  it('missing operating system', () => {
    operatingSystem = {};

    render(<OperatingSystemFormatter operatingSystem={operatingSystem} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'Not available'
    );
  });
});
