import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import Register from './Register';

const mockUpdateDocumentTitle = jest.fn();

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    updateDocumentTitle: mockUpdateDocumentTitle,
  })),
}));

jest.mock('../../Components/RegistrationProgress/RegProgressStepper', () => {
  const MockRegProgressStepper = () => (
    <div data-testid="reg-progress-stepper" />
  );
  MockRegProgressStepper.displayName = 'MockRegProgressStepper';
  return MockRegProgressStepper;
});

jest.mock('../../Utilities/Hooks', () => ({
  useLightspeedFeatureFlag: jest.fn(() => 'Insights'),
}));

describe('Register component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates document title to "Registration Assistant - Inventory"', () => {
    render(<Register />);

    expect(mockUpdateDocumentTitle).toHaveBeenCalledWith(
      'Registration Assistant - Inventory',
    );
    expect(mockUpdateDocumentTitle).not.toHaveBeenCalledWith(
      expect.stringContaining('Register Systems'),
    );
  });

  it('renders page header title as "Registration Assistant"', () => {
    render(<Register />);

    expect(
      screen.getByRole('heading', { name: 'Registration Assistant' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Register Systems/i }),
    ).not.toBeInTheDocument();
  });

  it('handles missing chrome or updateDocumentTitle gracefully', () => {
    useChrome.mockReturnValueOnce(undefined);
    expect(() => render(<Register />)).not.toThrow();

    useChrome.mockReturnValueOnce({});
    expect(() => render(<Register />)).not.toThrow();
  });
});
