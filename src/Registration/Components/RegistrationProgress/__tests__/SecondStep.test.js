import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import SecondStep from '../SecondStep';
import { operatingSystemList } from '../operatingSystemConstants';
import userEvent from '@testing-library/user-event';

describe('Second Step', () => {
  const setOperatingSystem = jest.fn();
  const setStep = jest.fn();

  it('should display rhel 7 selected', async () => {
    render(
      <Router>
        <SecondStep
          operatingSystem={operatingSystemList[1]}
          setOperatingSystem={setOperatingSystem}
          setStep={setStep}
        />
      </Router>,
    );

    expect(
      screen.getByRole('radio', {
        name: /rhel 7/i,
      }),
    ).toBeChecked();

    expect(
      screen.getByRole('radio', {
        name: /rhel 8/i,
      }),
    ).not.toBeChecked();
  });

  it('should update OS and set step', async () => {
    render(
      <Router>
        <SecondStep
          operatingSystem={operatingSystemList[1]}
          setOperatingSystem={setOperatingSystem}
          setStep={setStep}
        />
      </Router>,
    );

    await userEvent.click(
      screen.getByRole('radio', {
        name: /rhel 8/i,
      }),
    );

    expect(setOperatingSystem).toHaveBeenCalledWith(operatingSystemList[2]);
    expect(setStep).toHaveBeenCalledWith(2);
  });
});
