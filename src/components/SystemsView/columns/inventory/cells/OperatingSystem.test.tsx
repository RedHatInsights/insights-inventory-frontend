import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import OperatingSystem from './OperatingSystem';
import type { System } from '../../../hooks/useSystemsQuery';

const SYSTEM_ID = 'test-system-id';

const systemWithRhelOs = {
  id: SYSTEM_ID,
  system_profile: {
    operating_system: {
      name: 'RHEL',
      major: 8,
      minor: 10,
    },
  },
} as unknown as System;

const systemWithCentosOs = {
  id: SYSTEM_ID,
  system_profile: {
    operating_system: {
      name: 'CentOS Linux',
      major: 7,
      minor: 4,
    },
  },
} as unknown as System;

const systemWithoutProfile = {
  id: SYSTEM_ID,
} as unknown as System;

const systemWithProfileButNoOs = {
  id: SYSTEM_ID,
  system_profile: {},
} as unknown as System;

describe('OperatingSystem cell', () => {
  it('should show OS version from system_profile.operating_system', () => {
    render(<OperatingSystem system={systemWithRhelOs} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'RHEL 8.10',
    );
  });

  it('should show CentOS Linux OS version from system_profile.operating_system', () => {
    render(<OperatingSystem system={systemWithCentosOs} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'CentOS Linux 7.4',
    );
  });

  it('should show Not available when operating system data is missing', () => {
    const { rerender } = render(
      <OperatingSystem system={systemWithoutProfile} />,
    );

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'Not available',
    );

    rerender(<OperatingSystem system={systemWithProfileButNoOs} />);

    expect(screen.getByLabelText('Formatted OS version')).toHaveTextContent(
      'Not available',
    );
  });
});
