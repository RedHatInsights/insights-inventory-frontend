import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import InsightsDisconnected from './InsightsDisconnected';
import { useLightspeedFeatureFlag } from './hooks/useLightspeedFeatureFlag';

jest.mock('./hooks/useLightspeedFeatureFlag');

describe('InsightsDisconnected', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders disconnected indicator and shows Registration Assistant tooltip for Insights', async () => {
    useLightspeedFeatureFlag.mockReturnValue('Insights');

    render(<InsightsDisconnected />);

    const indicator = screen.getByLabelText('Disconnected indicator');
    expect(indicator).toBeInTheDocument();

    await userEvent.hover(indicator);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible();
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Insights client not reporting');
    expect(tooltip).toHaveTextContent(
      'From the main navigation, open "Registration Assistant" to learn how to set up Insights.',
    );
    expect(tooltip).not.toHaveTextContent('Register Systems');
  });

  it('renders Registration Assistant tooltip for Lightspeed when feature flag is enabled', async () => {
    useLightspeedFeatureFlag.mockReturnValue('Lightspeed');

    render(<InsightsDisconnected />);

    const indicator = screen.getByLabelText('Disconnected indicator');
    await userEvent.hover(indicator);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible();
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent(
      'From the main navigation, open "Registration Assistant" to learn how to set up Red Hat Lightspeed.',
    );
    expect(tooltip).not.toHaveTextContent('Register Systems');
  });
});
