import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BifrostTable from './BifrostTable';
import mockedBootCImageData from '../../__mocks__/mockedBootCImageData.json';

describe('BifrostTable', () => {
  test('should render Skeleton table', () => {
    render(<BifrostTable bootcImages={mockedBootCImageData} loaded={false} />);

    expect(
      screen.getByRole('grid', {
        name: /loading/i,
      })
    ).toBeVisible();
  });

  test('should render table', () => {
    render(<BifrostTable bootcImages={mockedBootCImageData} loaded={true} />);

    expect(
      screen.getByRole('cell', {
        name: /india pale ale/i,
      })
    ).toBeVisible();

    expect(
      screen.getByRole('cell', {
        name: /belgian/i,
      })
    ).toBeVisible();

    expect(
      screen.getByRole('cell', {
        name: /stout/i,
      })
    ).toBeVisible();
  });

  test('should open and close expanded rows', async () => {
    render(<BifrostTable bootcImages={mockedBootCImageData} loaded={true} />);
    expect(
      screen.queryByRole('cell', {
        name: /hash commit table/i,
      })
    ).not.toBeInTheDocument();

    const row = screen.getByRole('row', {
      name: /details india pale ale 2 3/i,
    });

    await userEvent.click(
      within(row).getByRole('button', {
        name: /details/i,
      })
    );

    expect(
      screen.getByRole('cell', {
        name: /hash commit table/i,
      })
    ).toBeVisible();

    await userEvent.click(
      within(row).getByRole('button', {
        name: /details/i,
      })
    );

    expect(
      screen.queryByRole('cell', {
        name: /hash commit table/i,
      })
    ).not.toBeInTheDocument();
  });
});
