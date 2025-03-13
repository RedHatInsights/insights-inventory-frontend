import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import OsModeLabel from './OsModeLabel';

describe('OsModeLabel', () => {
  it('should render with package mode', () => {
    render(<OsModeLabel osMode="package" />);

    expect(screen.getByText('Package mode')).toBeVisible();
  });

  it('should render with image mode', () => {
    render(<OsModeLabel osMode="image" />);

    expect(screen.getByText('Image mode')).toBeVisible();
  });

  it('should render package mode by default', () => {
    render(<OsModeLabel />);

    expect(screen.getByText('Package mode')).toBeVisible();
  });
});
