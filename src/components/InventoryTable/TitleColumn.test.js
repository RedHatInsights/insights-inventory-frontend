import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TitleColumn from './TitleColumn';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  // eslint-disable-next-line react/prop-types
  Link: ({ children, ...props }) => (
    <a className="fakeLink" {...props}>
      {children}
    </a>
  ),
}));

describe('TitleColumn', () => {
  it('should render correctly with NO data', () => {
    const { asFragment } = render(<TitleColumn />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const { asFragment } = render(
      <TitleColumn id="testId">something</TitleColumn>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with os_release', () => {
    const { asFragment } = render(
      <TitleColumn id="testId" item={{ os_release: 'os_release' }}>
        something
      </TitleColumn>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with href', () => {
    const { asFragment } = render(
      <TitleColumn id="testId" item={{ href: '/link/to/item' }}>
        something
      </TitleColumn>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly with to', () => {
    const { asFragment } = render(
      <TitleColumn id="testId" item={{ to: { pathname: '/link/to/item' } }}>
        something
      </TitleColumn>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render correctly no detail with data', () => {
    const { asFragment } = render(
      <TitleColumn
        id="testId"
        item={{ os_release: 'os_release' }}
        noDetail={true}
      >
        something
      </TitleColumn>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe('API', () => {
    it('should call onClick', async () => {
      const onClick = jest.fn();
      render(
        <TitleColumn
          id="testId"
          item={{ os_release: 'os_release' }}
          onRowClick={onClick}
          loaded
        >
          something
        </TitleColumn>
      );

      await userEvent.click(screen.getByText(/something/i));
      expect(onClick).toHaveBeenCalled();
    });

    it('should not call onClick if not loaded', async () => {
      const onClick = jest.fn();
      render(
        <TitleColumn
          id="testId"
          item={{ os_release: 'os_release' }}
          onRowClick={onClick}
        >
          something
        </TitleColumn>
      );

      await userEvent.click(screen.getByText(/something/i));
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
