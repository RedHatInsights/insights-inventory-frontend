import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RegAssistCodeBlock from '../RegAssistCodeBlock.js';
import {
  mockCodeOne,
  mockCodeTwo,
} from './__fixtures__/regAssistCodeBlock.fixtures.js';

const writeText = jest.fn();

Object.assign(navigator, {
  clipboard: {
    writeText,
  },
});

describe('RegAssistCodeBlock', () => {
  beforeEach(() => {
    navigator.clipboard.writeText.mockResolvedValue(undefined);
  });

  it('should render single line of code', () => {
    render(<RegAssistCodeBlock code={mockCodeOne} />);

    expect(screen.getByText(/this is a single line of code/i)).toBeVisible();
  });

  it('should render two lines of code', () => {
    render(<RegAssistCodeBlock code={mockCodeTwo} />);

    expect(screen.getByText(/this is multiple/i)).toBeVisible();
    expect(screen.getByText(/lines of code/i)).toBeVisible();
  });

  it('should copy text', async () => {
    render(<RegAssistCodeBlock code={mockCodeOne} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: /copy to clipboard/i,
      }),
    );

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCodeOne[0]);
  });
});
