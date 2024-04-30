import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BifrostTableRows from './BifrostTableRows';
import mockedBootCImageData from '../../__mocks__/mockedBootCImageData.json';
import { imageTableColumns, hashTableColumns } from './BifrostTableColumns';

describe('BifrostTableRows', () => {
  test('should render image name column', () => {
    render(
      <BifrostTableRows
        column={imageTableColumns[0]}
        data={mockedBootCImageData[0]}
      />
    );

    expect(screen.getByText(/india pale ale/i)).toBeVisible();
    expect(screen.queryByText(/2/i)).not.toBeInTheDocument();
  });

  test('should render hash commits column', () => {
    render(
      <BifrostTableRows
        column={imageTableColumns[1]}
        data={mockedBootCImageData[0]}
      />
    );

    expect(screen.getByText(/2/i)).toBeVisible();
    expect(screen.queryByText(/india pale ale/i)).not.toBeInTheDocument();
  });

  test('should render systems column', () => {
    render(
      <BifrostTableRows
        column={imageTableColumns[2]}
        data={mockedBootCImageData[0]}
      />
    );

    expect(screen.getByText(/3/i)).toBeVisible();
    expect(screen.queryByText(/india pale ale/i)).not.toBeInTheDocument();
  });

  test('should render image digest column', () => {
    render(
      <BifrostTableRows
        column={hashTableColumns[0]}
        data={mockedBootCImageData[0].hashes[0]}
      />
    );

    expect(screen.getByText(/hazy/i)).toBeVisible();
    expect(screen.queryByText(/2/i)).not.toBeInTheDocument();
  });

  test('should render hash system count column', () => {
    render(
      <BifrostTableRows
        column={hashTableColumns[1]}
        data={mockedBootCImageData[0].hashes[0]}
      />
    );

    expect(screen.getByText(/2/i)).toBeVisible();
    expect(screen.queryByText(/hazy/i)).not.toBeInTheDocument();
  });
});
