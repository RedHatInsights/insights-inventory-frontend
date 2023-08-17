/* eslint-disable camelcase */
import React from 'react';
import toJson from 'enzyme-to-json';
import InfrastructureCard from './InfrastructureCard';
import configureStore from 'redux-mock-store';
import { infraTest, rhsmFacts } from '../../../__mocks__/selectors';
import { mountWithRouter } from '../../../Utilities/TestingUtilities';
import { useParams } from 'react-router-dom';
const location = {};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
  useParams: jest.fn(() => ({ modalId: 'ipv4' })),
}));

describe('InfrastructureCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    location.pathname = 'localhost:3000/example/path';
    mockStore = configureStore();
    initialState = {
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...infraTest,
        },
      },
      entityDetails: {
        entity: {
          facts: {
            rhsm: rhsmFacts,
          },
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const wrapper = mountWithRouter(<InfrastructureCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with data', () => {
    const store = mockStore(initialState);
    const wrapper = mountWithRouter(<InfrastructureCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly with rhsm facts', () => {
    const store = mockStore({
      ...initialState,
      systemProfileStore: {
        systemProfile: {
          loaded: true,
        },
      },
    });
    const wrapper = mountWithRouter(<InfrastructureCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render enabled/disabled', () => {
    const store = mockStore({
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...infraTest,
        },
      },
      entityDetails: {
        entity: {},
      },
    });
    const wrapper = mountWithRouter(<InfrastructureCard store={store} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  describe('api', () => {
    it('should NOT call handleClick', () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      const wrapper = mountWithRouter(<InfrastructureCard store={store} />);
      wrapper.find('dd a').first().simulate('click');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should call handleClick on ipv4', () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/ipv4';
      useParams.mockImplementation(() => ({ modalId: 'ipv4' }));
      const wrapper = mountWithRouter(
        <InfrastructureCard handleClick={onClick} store={store} />
      );
      wrapper.find('dd a').first().simulate('click');
      expect(onClick).toHaveBeenCalled();
    });

    it('should call handleClick on ipv6', () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/ipv6';
      useParams.mockImplementation(() => ({ modalId: 'ipv6' }));
      const wrapper = mountWithRouter(
        <InfrastructureCard handleClick={onClick} store={store} />
      );
      wrapper.find('dd a').at(1).simulate('click');
      expect(onClick).toHaveBeenCalled();
    });

    it('should call handleClick on interfaces', () => {
      const store = mockStore(initialState);
      const onClick = jest.fn();
      location.pathname = 'localhost:3000/example/interfaces';
      useParams.mockImplementation(() => ({ modalId: 'interfaces' }));
      const wrapper = mountWithRouter(
        <InfrastructureCard handleClick={onClick} store={store} />
      );
      wrapper.find('dd a').at(2).simulate('click');
      expect(onClick).toHaveBeenCalled();
    });
  });

  ['hasType', 'hasVendor', 'hasIPv4', 'hasIPv6', 'hasInterfaces'].map((item) =>
    it(`should not render ${item}`, () => {
      const store = mockStore(initialState);
      const wrapper = mountWithRouter(
        <InfrastructureCard store={store} {...{ [item]: false }} />
      );
      expect(toJson(wrapper)).toMatchSnapshot();
    })
  );

  it('should render extra', () => {
    const store = mockStore(initialState);
    const wrapper = mountWithRouter(
      <InfrastructureCard
        store={store}
        extra={[
          { title: 'something', value: 'test' },
          {
            title: 'with click',
            value: '1 tests',
            onClick: (_e, handleClick) => handleClick('Something', {}, 'small'),
          },
        ]}
      />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
