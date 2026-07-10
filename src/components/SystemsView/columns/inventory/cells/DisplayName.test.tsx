import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useLocation } from 'react-router-dom';
import DisplayName, { type DisplayNameValue } from './DisplayName';
import { NOT_AVAILABLE } from '../../CellValue';
import { TestWrapper } from '../../../../../Utilities/TestingUtilities';
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
} satisfies DisplayNameValue;

const imageBasedSystemBootcDigest = {
  id: TEST_SYSTEM_ID,
  display_name: TEST_DISPLAY_NAME,
  system_profile: {
    bootc_status: {
      booted: { image_digest: 'sha256:abc123' },
    },
  },
} satisfies DisplayNameValue;

const imageBasedSystemEdge = {
  id: TEST_SYSTEM_ID,
  display_name: TEST_DISPLAY_NAME,
  system_profile: {
    host_type: 'edge',
  },
} satisfies DisplayNameValue;

const centosSystem = {
  id: TEST_SYSTEM_ID,
  display_name: TEST_DISPLAY_NAME,
  system_profile: {
    operating_system: { name: 'CentOS Linux', major: 7, minor: 4 },
  },
} satisfies DisplayNameValue;

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
        <DisplayName value={packageBasedSystem} />
      </TestWrapper>,
    );

    expect(
      screen.getByRole('link', { name: TEST_DISPLAY_NAME }),
    ).toBeInTheDocument();
  });

  it('should show the package-based system icon', () => {
    render(
      <TestWrapper>
        <DisplayName value={packageBasedSystem} />
      </TestWrapper>,
    );

    expect(screen.getByLabelText(/package mode icon/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/image mode icon/i)).not.toBeInTheDocument();
  });

  it('should show the image-based system icon when booted with a bootc image digest', () => {
    render(
      <TestWrapper>
        <DisplayName value={imageBasedSystemBootcDigest} />
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
        <DisplayName value={imageBasedSystemEdge} />
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
        <DisplayName value={centosSystem} />
      </TestWrapper>,
    );

    expect(screen.getByText(/convert system to rhel/i)).toBeVisible();
  });

  it('should navigate to system id when the display name link is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <>
          <DisplayName value={packageBasedSystem} />
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

  it(`should show ${NOT_AVAILABLE} when display name is missing`, () => {
    const { rerender } = render(
      <TestWrapper>
        <DisplayName
          value={{
            id: TEST_SYSTEM_ID,
            system_profile: {},
          }}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <DisplayName
          value={
            {
              id: TEST_SYSTEM_ID,
              display_name: null,
              system_profile: {},
            } as unknown as DisplayNameValue
          }
        />
      </TestWrapper>,
    );

    expect(screen.getByText(NOT_AVAILABLE)).toBeInTheDocument();
  });

  it('should show display name as text when id is missing', () => {
    render(
      <TestWrapper>
        <DisplayName
          value={{
            display_name: TEST_DISPLAY_NAME,
            system_profile: {},
          }}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(TEST_DISPLAY_NAME)).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: TEST_DISPLAY_NAME }),
    ).not.toBeInTheDocument();
  });
});
