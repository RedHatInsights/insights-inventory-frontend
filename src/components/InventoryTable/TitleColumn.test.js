import React from 'react';
import TitleColumn from './TitleColumn';
import { act, fireEvent, render } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, ...props }) => <a class="fakeLink" {...props}>{children}</a>, // eslint-disable-line
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
    it('should call onClick', () => {
      const onClick = jest.fn();
      const { container } = render(
        <TitleColumn
          id="testId"
          item={{ os_release: 'os_release' }}
          onRowClick={onClick}
          loaded
        >
          something
        </TitleColumn>
      );

      const link = container.querySelector('a');
      act(() => {
        fireEvent.click(link);
      });

      expect(onClick).toHaveBeenCalled();
    });

    it('should not call onClick if not loaded', () => {
      const onClick = jest.fn();
      const { container } = render(
        <TitleColumn
          id="testId"
          item={{ os_release: 'os_release' }}
          onRowClick={onClick}
        >
          something
        </TitleColumn>
      );

      const link = container.querySelector('a');
      act(() => {
        fireEvent.click(link);
      });

      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
