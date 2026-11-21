import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TestWrapper } from '../../Utilities/TestingUtilities';
import InsightsPrompt from './InsightsPrompt';
import { useLightspeedFeatureFlag } from '../../Utilities/hooks/useLightspeedFeatureFlag';

jest.mock('../../Utilities/hooks/useLightspeedFeatureFlag', () => ({
  useLightspeedFeatureFlag: jest.fn(),
}));

describe('InsightsPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLightspeedFeatureFlag.mockReturnValue('Insights');
  });

  it('renders the alert banner with the pf-v6-u-mb-md spacing class', () => {
    const { container } = render(
      <TestWrapper>
        <InsightsPrompt />
      </TestWrapper>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const alert = container.querySelector('.pf-v6-c-alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('pf-v6-u-mb-md');
  });

  it('renders the alert content with default platform name', () => {
    render(
      <TestWrapper>
        <InsightsPrompt />
      </TestWrapper>,
    );

    expect(
      screen.getByText('Your insights-client is not reporting'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('With Insights you can easily:'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Host not reporting data to Red Hat Insights',
      }),
    ).toBeInTheDocument();
  });

  it('renders platform-specific text when Lightspeed feature flag is enabled', () => {
    useLightspeedFeatureFlag.mockReturnValue('Lightspeed');

    render(
      <TestWrapper>
        <InsightsPrompt />
      </TestWrapper>,
    );

    expect(
      screen.getByText('With Red Hat Lightspeed you can easily:'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Host not reporting data to Red Hat Lightspeed',
      }),
    ).toBeInTheDocument();
  });
});
