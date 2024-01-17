import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithRouter } from '../../Utilities/TestingUtilities';
import SystemNotFound from './SystemNotFound';

describe('SystemNotFound', () => {
  it('should render correctly', () => {
    renderWithRouter(<SystemNotFound />);

    screen.getByRole('heading', {
      name: /system not found/i,
    });
    screen.getByText(/system with id does not exist/i);
    screen.getByRole('button', {
      name: /back to previous page/i,
    });
  });

  it('should render correctly with inv ID', () => {
    renderWithRouter(<SystemNotFound inventoryId="something" />);

    screen.getByText(/system with id something does not exist/i);
  });
});

it('should call onBackToListClick correctly', async () => {
  const onBackToListClick = jest.fn();
  renderWithRouter(
    <SystemNotFound
      inventoryId="something"
      onBackToListClick={onBackToListClick}
    />
  );

  await userEvent.click(
    screen.getByRole('button', {
      name: /back to previous page/i,
    })
  );
  expect(onBackToListClick).toHaveBeenCalled();
});
