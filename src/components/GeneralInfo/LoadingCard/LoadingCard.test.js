import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RouterWrapper } from '../../../Utilities/TestingUtilities';
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
      const view = render(
        <RouterWrapper>
          <LoadingCard
            isLoading={isLoading}
            title={`Card that is ${isLoading ? 'loading' : 'loaded'}`}
          />
        </RouterWrapper>
      );

      expect(view.asFragment()).toMatchSnapshot();
    });
  });

  it('should render loading bars', () => {
    const view = render(
      <RouterWrapper>
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
      </RouterWrapper>
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it(`Loading card render`, () => {
    const view = render(
      <RouterWrapper>
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
      </RouterWrapper>
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('Clickable should render - no data', () => {
    const view = render(
      <RouterWrapper>
        <Clickable onClick={jest.fn()} />
      </RouterWrapper>
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('none/not available', () => {
    it(`should not be clickable when the value is 0`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^None$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should not be clickable when the value is 0 with plural`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^0 systems$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should not be clickable when the value is undefined`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^Not available$/
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be none when value is 0`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^None$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be not available when value is undefined`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^Not available$/
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`plurazied none`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^0 systems$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be clickable with plural`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^23 systems$/);
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it(`should be clickable with custom plural`, () => {
      render(
        <RouterWrapper>
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
        </RouterWrapper>
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^23 processes$/
      );
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });

  it('Clickable should render', () => {
    render(
      <RouterWrapper>
        <Clickable value="15" target="some-target" />
      </RouterWrapper>
    );

    expect(screen.getByRole('link', { name: /15/i })).toHaveAttribute(
      'href',
      '/some-target'
    );
  });

  it('clickable should click', async () => {
    const onClick = jest.fn();

    render(
      <RouterWrapper>
        <Clickable onClick={onClick} value="15" target="path" />,
      </RouterWrapper>
    );

    await userEvent.click(screen.getByRole('link', { name: /15/i }));
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  it('Clickable should render - 0 value', async () => {
    const onClick = jest.fn();

    const view = render(
      <RouterWrapper>
        <Clickable onClick={onClick} value={0} target="some-target" />
      </RouterWrapper>
    );

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
    });
    expect(view.asFragment()).toMatchSnapshot();
  });
});
