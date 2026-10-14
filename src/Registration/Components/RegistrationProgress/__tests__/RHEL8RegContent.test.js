import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import RHEL8RegContent from '../RHEL8RegContent';
import { mockFetchedKeys } from './content.fixtures';

describe('RHEL8RegContent', () => {
  it('display activation key', async () => {
    render(
      <Router>
        <RHEL8RegContent orgId="98765432" selectedKey={mockFetchedKeys[0]} />
      </Router>,
    );

    expect(
      screen.getByText(
        /subscription-manager register --activationkey activation-key-1 --org 98765432/i,
      ),
    ).toBeVisible();
  });
});
