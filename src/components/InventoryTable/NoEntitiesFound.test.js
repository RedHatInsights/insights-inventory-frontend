import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NoEntitiesFound from './NoEntitiesFound';

describe('NoSystemsTable', () => {
  it('should render correctly - no systems', () => {
    render(<NoEntitiesFound />);

    expect(
      screen.getByRole('heading', {
        name: /no matching systems found/i,
      })
    ).toBeVisible();
    expect(
      screen.getByText(/to continue, edit your filter settings and try again/i)
    ).toBeVisible();
  });

  it('should render correctly - no groups', () => {
    render(<NoEntitiesFound entities="groups" />);

    expect(
      screen.getByRole('heading', {
        name: /no matching groups found/i,
      })
    ).toBeVisible();
    expect(
      screen.getByText(/to continue, edit your filter settings and try again/i)
    ).toBeVisible();
  });

  it('renders link if callback provided', async () => {
    const callback = jest.fn();
    render(<NoEntitiesFound onClearAll={callback} />);

    await userEvent.click(
      screen.getByRole('button', {
        name: /clear all filters/i,
      })
    );
    expect(callback).toBeCalled();
  });
});
