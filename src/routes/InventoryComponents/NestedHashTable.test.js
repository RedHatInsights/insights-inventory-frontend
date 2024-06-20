import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NestedHashTable from './NestedHashTable';
import mockedBootCImageData from '../../__mocks__/mockedBootCImageData.json';

describe('NestedHashTable', () => {
  test('Nested hash table', () => {
    render(<NestedHashTable hashes={mockedBootCImageData[0].hashes} />);

    expect(
      screen.getByRole('cell', {
        name: /hazy/i,
      })
    ).toBeVisible();

    expect(
      screen.getByRole('cell', {
        name: /west coast/i,
      })
    ).toBeVisible();
  });
});
