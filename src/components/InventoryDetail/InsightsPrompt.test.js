import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import InsightsPrompt from './InsightsPrompt';
import { useLightspeedFeatureFlag } from '../../Utilities/hooks/useLightspeedFeatureFlag';

jest.mock('../../Utilities/hooks/useLightspeedFeatureFlag');

describe('InsightsPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLightspeedFeatureFlag.mockReturnValue('Insights');
  });

  it('renders the alert with bottom margin class pf-v6-u-mb-md', () => {
    /* eslint-disable testing-library/no-node-access */
    render(
      <MemoryRouter>
        <InsightsPrompt />
      </MemoryRouter>,
    );

    const alert = screen
      .getByText('Your insights-client is not reporting')
      .closest('.pf-v6-c-alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('pf-v6-u-mb-md');
    /* eslint-enable testing-library/no-node-access */
  });

  it('renders the alert title and default content when platformName is Insights', () => {
    render(
      <MemoryRouter>
        <InsightsPrompt />
      </MemoryRouter>,
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

  it('renders Lightspeed branding when platformName is Lightspeed', () => {
    useLightspeedFeatureFlag.mockReturnValue('Lightspeed');

    render(
      <MemoryRouter>
        <InsightsPrompt />
      </MemoryRouter>,
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

  it('renders registration link and security link', () => {
    render(
      <MemoryRouter>
        <InsightsPrompt />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', {
        name: 'How to register with insights-client?',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'How does Red Hat keep data secure?',
      }),
    ).toBeInTheDocument();
  });
});
