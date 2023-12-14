/* eslint-disable no-unused-vars */
/* eslint-disable react/display-name */
/* eslint-disable camelcase */
import React from 'react';
import { mount, render } from 'enzyme';
import toJson from 'enzyme-to-json';
import GeneralInformation from './GeneralInformation';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import {
  biosTest,
  collectInfoTest,
  configTest,
  infraTest,
  osTest,
  testProperties,
} from '../../../__mocks__/selectors';
import promiseMiddleware from 'redux-promise-middleware';
import { MemoryRouter } from 'react-router-dom';

import { hosts } from '../../../api/api';
import MockAdapter from 'axios-mock-adapter';
import mockedData from '../../../__mocks__/mockedData.json';
const mock = new MockAdapter(hosts.axios, { onNoMatch: 'throwException' });

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => location,
}));

const location = {};

describe('GeneralInformation', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    location.pathname = 'localhost:3000/example/path';
    mockStore = configureStore([promiseMiddleware]);
    initialState = {
      entityDetails: {
        entity: {
          id: 'test-id',
          per_reporter_staleness: {},
        },
      },
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...infraTest,
          ...osTest,
          ...biosTest,
          ...collectInfoTest,
          ...configTest,
          ...testProperties,
          network: {
            ipv4: ['1', '2'],
            ipv6: ['6', '3'],
            interfaces: [
              {
                mac_address: '0:0:0',
                mtu: 150,
                name: 'some name',
                state: 'UP',
                type: 'some type',
              },
              {
                mac_address: '1:0:0',
                mtu: 1150,
                name: 'asome name',
                state: 'UP',
                type: 'asome type',
              },
            ],
          },
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    const store = mockStore({ systemProfileStore: {}, entityDetails: {} });
    const wrapper = render(
      <MemoryRouter>
        <Provider store={store}>
          <GeneralInformation inventoryId={'test-id'} />
        </Provider>
      </MemoryRouter>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render correctly', () => {
    const store = mockStore(initialState);
    const wrapper = render(
      <MemoryRouter>
        <Provider store={store}>
          <GeneralInformation />
        </Provider>
      </MemoryRouter>
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  describe('custom components', () => {
    [
      'SystemCardWrapper',
      'OperatingSystemCardWrapper',
      'BiosCardWrapper',
      'InfrastructureCardWrapper',
      'ConfigurationCardWrapper',
      'CollectionCardWrapper',
    ].map((item) => {
      it(`should not render ${item}`, () => {
        const store = mockStore(initialState);
        const wrapper = render(
          <MemoryRouter>
            <Provider store={store}>
              <GeneralInformation
                {...{ [item]: false }}
                inventoryId={'test-id'}
              />
            </Provider>
          </MemoryRouter>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
      });

      it(`should render custom ${item}`, () => {
        const store = mockStore(initialState);
        const wrapper = render(
          <MemoryRouter>
            <Provider store={store}>
              <GeneralInformation
                {...{ [item]: () => <div>test</div> }}
                inventoryId={'test-id'}
              />
            </Provider>
          </MemoryRouter>
        );
        expect(toJson(wrapper)).toMatchSnapshot();
      });
    });
  });

  describe('API', () => {
    mock
      .onGet('/api/inventory/v1/hosts/test-id/system_profile')
      .reply(200, mockedData);
    it('should get data from server', () => {
      const store = mockStore({
        systemProfileStore: {},
        entityDetails: {
          entity: {
            id: 'test-id',
            per_reporter_staleness: {},
          },
        },
      });
      mount(
        <MemoryRouter>
          <Provider store={store}>
            <GeneralInformation inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>
      );
      expect(store.getActions()[0].type).toBe('LOAD_SYSTEM_PROFILE_PENDING');
    });

    it('should open modal', () => {
      const store = mockStore(initialState);
      location.pathname = 'localhost:3000/example/running_processes';
      const wrapper = mount(
        <MemoryRouter>
          <Provider store={store}>
            <GeneralInformation inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>,
        ['Test detail page', '/:inventory/:modalId']
      );
      wrapper.find('a[href$="running_processes"]').first().simulate('click');
      wrapper.update();
      expect(
        wrapper.find('GeneralInformation').instance().state.isModalOpen
      ).toBe(true);
      expect(
        wrapper.find('GeneralInformation').instance().state.modalTitle
      ).toBe('Running processes');
    });

    it('should open modal', () => {
      const store = mockStore(initialState);
      location.pathname = 'localhost:3000/example/running_processes';
      const wrapper = mount(
        <MemoryRouter>
          <Provider store={store}>
            <GeneralInformation inventoryId={'test-id'} />
          </Provider>
        </MemoryRouter>
      );
      wrapper.find('a[href$="running_processes"]').first().simulate('click');
      wrapper.update();
      wrapper
        .find('.ins-c-inventory__detail--dialog button.pf-m-plain')
        .first()
        .simulate('click');
      wrapper.update();
      expect(
        wrapper.find('GeneralInformation').instance().state.isModalOpen
      ).toBe(false);
    });
  });
});
