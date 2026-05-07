import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useLocation } from 'react-router-dom';
import DisplayName from './DisplayName';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
import type { System } from '../../../hooks/useSystemsQuery';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate',
);

const mockedUseInsightsNavigate = useInsightsNavigate as jest.MockedFunction<
  typeof useInsightsNavigate
>;

const TEST_SYSTEM_ID = 'test-system-id';
const TEST_DISPLAY_NAME = 'My test system';

const packageBasedSystem = {
  id: TEST_SYSTEM_ID,
  display_name: TEST_DISPLAY_NAME,
  system_profile: {},
} as System;

const imageBasedSystemBootcDigest = {
  id: TEST_SYSTEM_ID,
  display_name: TEST_DISPLAY_NAME,
  system_profile: {
    bootc_status: {
      booted: { image_digest: 'sha256:abc123' },
    },
  },
} as System;

const imageBasedSystemEdge = {
  id: TEST_SYSTEM_ID,
  display_name: TEST_DISPLAY_NAME,
  system_profile: {
    host_type: 'edge',
  },
} as System;

const centosSystem = {
  id: TEST_SYSTEM_ID,
  display_name: TEST_DISPLAY_NAME,
  system_profile: {
    operating_system: { name: 'CentOS Linux' },
  },
} as System;

function LocationProbe() {
  const { pathname } = useLocation();
  return <span data-testid="current-pathname">{pathname}</span>;
}

describe('DisplayName cell', () => {
  beforeEach(() => {
    mockedUseInsightsNavigate.mockReturnValue(jest.fn());
  });

  it('should show the display name link', () => {
    render(
      <TestWrapper>
        <DisplayName system={packageBasedSystem} />
      </TestWrapper>,
    );

    expect(
      screen.getByRole('link', { name: TEST_DISPLAY_NAME }),
    ).toBeInTheDocument();
  });

  it('should show the package-based system icon', () => {
    render(
      <TestWrapper>
        <DisplayName system={packageBasedSystem} />
      </TestWrapper>,
    );

    expect(screen.getByLabelText(/package mode icon/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/image mode icon/i)).not.toBeInTheDocument();
  });

  it('should show the image-based system icon when booted with a bootc image digest', () => {
    render(
      <TestWrapper>
        <DisplayName system={imageBasedSystemBootcDigest} />
      </TestWrapper>,
    );

    expect(screen.getByLabelText(/image mode icon/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/package mode icon/i),
    ).not.toBeInTheDocument();
  });

  it('should show the image-based system icon when host type is edge', () => {
    render(
      <TestWrapper>
        <DisplayName system={imageBasedSystemEdge} />
      </TestWrapper>,
    );

    expect(screen.getByLabelText(/image mode icon/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/package mode icon/i),
    ).not.toBeInTheDocument();
  });

  it('should show ConversionPopover when operating system is CentOS Linux', () => {
    render(
      <TestWrapper>
        <DisplayName system={centosSystem} />
      </TestWrapper>,
    );

    expect(screen.getByText(/convert system to rhel/i)).toBeVisible();
  });

  it('should navigate to system id when the display name link is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <>
          <DisplayName system={packageBasedSystem} />
          <LocationProbe />
        </>
      </TestWrapper>,
    );

    expect(screen.getByTestId('current-pathname')).toHaveTextContent('/');

    await user.click(screen.getByRole('link', { name: TEST_DISPLAY_NAME }));

    expect(screen.getByTestId('current-pathname')).toHaveTextContent(
      `/${TEST_SYSTEM_ID}`,
    );
  });
});
