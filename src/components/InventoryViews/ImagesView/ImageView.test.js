import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImagesView } from './ImagesView';

let mockUseRows = [];
jest.mock('./hooks/useRows', () => ({
  useRows: () => {
    return mockUseRows;
  },
}));

const createQueryResult = (overrides = {}) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  ...overrides,
});

let mockUseImageQueries = [
  createQueryResult(),
  createQueryResult(),
  createQueryResult(),
];

jest.mock('./hooks/useImageQueries', () => ({
  useImageQueries: () => {
    return mockUseImageQueries;
  },
}));

const EMPTY_RESULTS = [];
const NON_EMPTY_RESULTS = [{}];

describe('ImagesView', () => {
  beforeEach(() => {
    mockUseRows = [];
  });

  test('shows loading state when any query is loading', () => {
    mockUseImageQueries = [
      createQueryResult({ isLoading: true }),
      createQueryResult(),
      createQueryResult(),
    ];

    render(<ImagesView />);

    expect(
      screen.getByRole('progressbar', { hidden: true }),
    ).toBeInTheDocument();
  });

  test('shows error state when any query has error', () => {
    mockUseImageQueries = [
      createQueryResult(),
      createQueryResult({ isError: true }),
      createQueryResult(),
    ];

    render(<ImagesView />);

    expect(screen.getByText(/Unable to load data/i)).toBeInTheDocument();
  });

  test('shows empty state when data is loaded and rows are empty', () => {
    mockUseImageQueries = [
      createQueryResult({ data: EMPTY_RESULTS }),
      createQueryResult({ data: { total: 0 } }),
      createQueryResult({ data: { total: 0 } }),
    ];
    mockUseRows = [];

    render(<ImagesView />);

    expect(screen.getByText(/No matching/i)).toBeInTheDocument();
  });

  test('shows table with image and system type rows when data is loaded', () => {
    mockUseImageQueries = [
      createQueryResult({ data: NON_EMPTY_RESULTS }),
      createQueryResult({ data: { total: 5 } }),
      createQueryResult({ data: { total: 2 } }),
    ];

    mockUseRows = [
      {
        id: 'my-image',
        row: ['my-image', 1, 3],
        children: [],
      },
      { id: 'package-based', row: ['Package based systems', '', 5] },
      { id: 'edge', row: ['Immutable (OSTree) image based systems', '', 2] },
    ];

    render(<ImagesView />);

    expect(screen.getByText('my-image')).toBeInTheDocument();
    expect(screen.getByText('Package based systems')).toBeInTheDocument();
    expect(screen.getByText(/Immutable.*OSTree/i)).toBeInTheDocument();
  });
});
