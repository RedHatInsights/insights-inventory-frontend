import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Register from './Register';
import { useLightspeedFeatureFlag } from '../../Utilities/Hooks';

const mockUpdateDocumentTitle = jest.fn();

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    updateDocumentTitle: mockUpdateDocumentTitle,
  }),
}));

jest.mock('../../Utilities/Hooks', () => ({
  useLightspeedFeatureFlag: jest.fn(),
}));

jest.mock('../../Components/RegistrationProgress/RegProgressStepper', () => {
  const MockRegProgressStepper = () => (
    <div data-testid="reg-progress-stepper" />
  );
  return MockRegProgressStepper;
});

describe('Register route component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates document title to "Registration Assistant - Inventory" on mount', () => {
    useLightspeedFeatureFlag.mockReturnValue('Insights');

    render(<Register />);

    expect(mockUpdateDocumentTitle).toHaveBeenCalledTimes(1);
    expect(mockUpdateDocumentTitle).toHaveBeenCalledWith(
      'Registration Assistant - Inventory',
    );
    expect(mockUpdateDocumentTitle).not.toHaveBeenCalledWith(
      'Register Systems - Inventory',
    );
  });

  it('renders page header title as "Registration Assistant"', () => {
    useLightspeedFeatureFlag.mockReturnValue('Insights');

    render(<Register />);

    expect(
      screen.getByRole('heading', { name: 'Registration Assistant' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Register Systems' }),
    ).not.toBeInTheDocument();
  });

  it('renders Insights copy and stepper when Lightspeed feature flag is inactive', () => {
    useLightspeedFeatureFlag.mockReturnValue('Insights');

    render(<Register />);

    expect(
      screen.getByText(
        /The Insights for RHEL registration assistant will guide you through the setup process/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('reg-progress-stepper')).toBeInTheDocument();
  });

  it('renders Lightspeed copy and stepper when Lightspeed feature flag is active', () => {
    useLightspeedFeatureFlag.mockReturnValue('Lightspeed');

    render(<Register />);

    expect(
      screen.getByText(
        /The Red Hat Lightspeed registration assistant will guide you through the setup process/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('reg-progress-stepper')).toBeInTheDocument();
  });
});
