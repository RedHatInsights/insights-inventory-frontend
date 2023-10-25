import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithRouter } from '../../../Utilities/TestingUtilities';
import LoadingCard, { Clickable } from './LoadingCard';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3000/example/path',
  }),
  useParams: () => ({
    modalId: 'path',
  }),
}));

describe('LoadingCard', () => {
  [true, false].map((isLoading) => {
    it(`Loading card render - isLoading: ${isLoading}`, () => {
      const view = renderWithRouter(
        <LoadingCard
          isLoading={isLoading}
          title={`Card that is ${isLoading ? 'loading' : 'loaded'}`}
        />
      );
      expect(view.asFragment()).toMatchSnapshot();
    });
  });

  it('should render loading bars', () => {
    const view = renderWithRouter(
      <LoadingCard
        isLoading={true}
        title="Some title"
        items={[
          {
            onClick: jest.fn(),
            title: 'test-title',
            size: 'md',
            value: 'some value',
          },
          {
            title: 'just title',
          },
        ]}
      />
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it(`Loading card render`, () => {
    const view = renderWithRouter(
      <LoadingCard
        isLoading={false}
        title="Some title"
        items={[
          {
            onClick: jest.fn(),
            title: 'test-title',
            size: 'md',
            value: 'some value',
          },
          {
            title: 'just title',
          },
        ]}
      />
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('Clickable should render - no data', () => {
    const view = renderWithRouter(<Clickable onClick={jest.fn()} />);
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('none/not available', () => {
    it(`should not be clickable when the value is 0`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              onClick: jest.fn(),
              title: 'test-title',
              value: 0,
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^None$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should not be clickable when the value is 0 with plural`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              onClick: jest.fn(),
              title: 'test-title',
              value: 0,
              singular: 'system',
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^0 systems$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should not be clickable when the value is undefined`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              onClick: jest.fn(),
              title: 'test-title',
              value: undefined,
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^Not available$/
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be none when value is 0`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              title: 'test-title',
              value: 0,
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^None$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be not available when value is undefined`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              title: 'test-title',
              value: undefined,
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^Not available$/
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`plurazied none`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              title: 'test-title',
              value: 0,
              singular: 'system',
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^0 systems$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be clickable with plural`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              onClick: jest.fn(),
              title: 'test-title',
              value: 23,
              singular: 'system',
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^23 systems$/);
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it(`should be clickable with custom plural`, () => {
      renderWithRouter(
        <LoadingCard
          isLoading={false}
          title="Some title"
          items={[
            {
              onClick: jest.fn(),
              title: 'test-title',
              value: 23,
              singular: 'process',
              plural: 'processes',
            },
          ]}
        />
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^23 processes$/
      );
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });

  it('Clickable should render', () => {
    renderWithRouter(<Clickable value="15" target="some-target" />);

    expect(screen.getByRole('link', { name: /15/i })).toHaveAttribute(
      'href',
      '/some-target'
    );
  });

  it('clickable should click', async () => {
    const onClick = jest.fn();

    renderWithRouter(
      <Clickable onClick={onClick} value="15" target="path" />,
      'http://localhost:5000/inventoryId/modalId'
    );

    await userEvent.click(screen.getByRole('link', { name: /15/i }));
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  it('Clickable should render - 0 value', async () => {
    const onClick = jest.fn();

    const view = renderWithRouter(
      <Clickable onClick={onClick} value={0} target="some-target" />
    );

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
    });
    expect(view.asFragment()).toMatchSnapshot();
  });
});
