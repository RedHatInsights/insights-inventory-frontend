import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import ThirdStep from '../ThirdStep';
import { mockFetchedKeys } from './content.fixtures';
import RHEL7RegContent from '../RHEL7RegContent';

describe('ThirdStep', () => {
  const setStep = jest.fn();

  it('should display activation key', async () => {
    render(
      <Router>
        <ThirdStep
          OperatingSystemComponent={RHEL7RegContent}
          orgId="98765432"
          selectedKey={mockFetchedKeys[0]}
          setStep={setStep}
        />
      </Router>,
    );

    expect(
      screen.getByText(
        /subscription-manager register --activationkey activation-key-1 --org 98765432/i,
      ),
    ).toBeVisible();
  });
});
