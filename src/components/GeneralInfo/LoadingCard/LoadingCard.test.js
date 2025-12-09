import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
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
        <TestWrapper>
          <LoadingCard
            isLoading={isLoading}
            title={`Card that is ${isLoading ? 'loading' : 'loaded'}`}
          />
        </TestWrapper>,
      );

      expect(view.asFragment()).toMatchSnapshot();
    });
  });

  it('should render loading bars', () => {
    const view = render(
      <TestWrapper>
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
      </TestWrapper>,
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should render the card expanded by default', () => {
    render(
      <TestWrapper>
        <LoadingCard
          isLoading={false}
          title="Expandable Card"
          items={[
            {
              title: 'test-item',
              value: 'test-value',
            },
          ]}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Expandable Card')).toBeVisible();
    expect(screen.getByText('test-item')).toBeVisible();
    expect(screen.getByText('test-value')).toBeVisible();
  });

  it('Clickable should render - no data', () => {
    const view = render(
      <TestWrapper>
        <Clickable onClick={jest.fn()} />
      </TestWrapper>,
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('none/not available', () => {
    it(`should not be clickable when the value is 0`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^None$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should not be clickable when the value is 0 with plural`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^0 systems$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should not be clickable when the value is undefined`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^Not available$/,
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be none when value is 0`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^None$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be not available when value is undefined`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^Not available$/,
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`plurazied none`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^0 systems$/);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it(`should be clickable with plural`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(/^23 systems$/);
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it(`should be clickable with custom plural`, () => {
      render(
        <TestWrapper>
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
        </TestWrapper>,
      );

      expect(screen.getByRole('definition')).toHaveTextContent(
        /^23 processes$/,
      );
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });

  it('Clickable should render', () => {
    render(
      <TestWrapper>
        <Clickable value="15" target="some-target" />
      </TestWrapper>,
    );

    expect(screen.getByRole('link', { name: /15/i })).toHaveAttribute(
      'href',
      'localhost:3000/example/path/some-target',
    );
  });

  it('clickable should click', async () => {
    const onClick = jest.fn();

    render(
      <TestWrapper>
        <Clickable onClick={onClick} value="15" target="path" />,
      </TestWrapper>,
    );

    await userEvent.click(screen.getByRole('link', { name: /15/i }));
    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  it('Clickable should render - 0 value', async () => {
    const onClick = jest.fn();

    const view = render(
      <TestWrapper>
        <Clickable onClick={onClick} value={0} target="some-target" />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(onClick).not.toHaveBeenCalled();
    });
    expect(view.asFragment()).toMatchSnapshot();
  });

  describe('Column layout', () => {
    const createItems = (count) =>
      Array.from({ length: count }, (_, i) => ({
        title: `Item ${i + 1}`,
        value: `Value ${i + 1}`,
      }));

    it('should use 3 columns when there are 3 or fewer items', () => {
      [1, 2, 3].forEach((itemCount) => {
        const { container } = render(
          <TestWrapper>
            <LoadingCard
              isLoading={false}
              title="Test Card"
              items={createItems(itemCount)}
            />
          </TestWrapper>,
        );

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        const descriptionList = container.querySelector(
          '.pf-v6-c-description-list',
        );
        expect(descriptionList).toBeInTheDocument();
        expect(descriptionList).toHaveClass(
          'pf-v6-c-description-list pf-m-1-col',
        );
      });
    });

    it('should use 2 columns when there are more than 3 items', () => {
      [4, 5, 6, 10].forEach((itemCount) => {
        const { container } = render(
          <TestWrapper>
            <LoadingCard
              isLoading={false}
              title="Test Card"
              items={createItems(itemCount)}
            />
          </TestWrapper>,
        );

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        const descriptionList = container.querySelector(
          '.pf-v6-c-description-list',
        );
        expect(descriptionList).toBeInTheDocument();
        expect(descriptionList).toHaveClass('pf-m-2-col');
      });
    });

    it('should render items in separate DescriptionListGroups for proper column flow', () => {
      const { container } = render(
        <TestWrapper>
          <LoadingCard
            isLoading={false}
            title="Test Card"
            items={createItems(4)}
          />
        </TestWrapper>,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const descriptionListGroups = container.querySelectorAll(
        '.pf-v6-c-description-list__group',
      );
      expect(descriptionListGroups).toHaveLength(4);
    });
  });

  describe('expandable card', () => {
    it('should collapse and expand when toggle button is clicked', async () => {
      render(
        <TestWrapper>
          <LoadingCard
            isLoading={false}
            title="Expandable Card"
            items={[
              {
                title: 'test-item',
                value: 'test-value',
              },
            ]}
          />
        </TestWrapper>,
      );

      // Content should be visible initially
      expect(screen.getByText('test-value')).toBeVisible();

      // Click the toggle button to collapse
      const toggleButton = screen.getByRole('button');
      await userEvent.click(toggleButton);

      // Content should not be in the document after collapse
      await waitFor(() => {
        expect(screen.queryByText('test-value')).not.toBeInTheDocument();
      });

      // Title should still be visible
      expect(screen.getByText('Expandable Card')).toBeVisible();

      // Expand the card again
      await userEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.getByText('test-value')).toBeVisible();
      });
    });
  });
});
