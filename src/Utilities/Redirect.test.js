import React from 'react';
import { render } from '@testing-library/react';
import { useParams, Navigate } from 'react-router-dom';
import Redirect from './Redirect'; // Adjust the import path accordingly

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  Navigate: jest.fn(() => null), // Mock Navigate as a null render
}));

describe('Redirect', () => {
  it('should redirect to the correct path with params', () => {
    // Mock the useParams hook to return test params
    useParams.mockReturnValue({ id: '123' });

    const to = '/path/:id/details';
    const replace = true;
    const state = { from: 'test' };

    render(<Redirect to={to} replace={replace} state={state} />);

    // Assert that Navigate was called with the correct arguments
    expect(Navigate).toHaveBeenCalledWith(
      {
        to: '/path/123/details',
        replace,
        state,
      },
      {}
    );
  });
});
