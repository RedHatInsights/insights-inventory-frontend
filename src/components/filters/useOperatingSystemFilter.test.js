import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import { mockSystemProfile } from '../../__mocks__/hostApi';
import { availableVersions } from '../../Utilities/__mocks__/OperatingSystemFilterHelpers.fixtures';
import useOperatingSystemFilter from './useOperatingSystemFilter';

describe('useOperatingSystemFilter', () => {
  const mockStore = configureStore([promiseMiddleware()]);

  beforeEach(() => {
    mockSystemProfile.onGet().replyOnce(200);
  });

  describe('with operating systems yet not loaded', () => {
    const wrapper = ({ children }) => (
      <Provider store={mockStore({})}>{children}</Provider>
    );

    it('should initiate an API request', async () => {
      renderHook(() => useOperatingSystemFilter([], true, true), { wrapper });
      await waitFor(() => {
        expect(mockSystemProfile.history.get.length).toBe(1);
      });
      mockSystemProfile.resetHistory();
    });

    it('should return empty state value', () => {
      const { result } = renderHook(
        () => useOperatingSystemFilter([], true, true),
        { wrapper }
      );
      expect(result.current).toMatchSnapshot();
    });
  });

  describe('with operating systems loaded', () => {
    const wrapper = ({ children }) => (
      <Provider
        store={mockStore({
          entities: {
            operatingSystems: availableVersions,
            operatingSystemsLoaded: true,
          },
        })}
      >
        {children}
      </Provider>
    );

    it('should match snapshot', () => {
      const { result } = renderHook(
        () => useOperatingSystemFilter([], true, true),
        { wrapper }
      );
      expect(result.current).toMatchSnapshot();
    });

    it('should return correct filter config', () => {
      const { result } = renderHook(
        () => useOperatingSystemFilter([], true, true),
        { wrapper }
      );
      const [config] = result.current;
      expect(config.filterValues.groups.length).toBe(5);
      expect(config.label).toBe('Operating System'); // should be all caps
      expect(config.type).toBe('group');
    });

    it('should return correct chips array, current value and value setter', () => {
      const { result } = renderHook(
        () => useOperatingSystemFilter([], true, true),
        { wrapper }
      );
      const [, chips, value, setValue] = result.current;
      expect(chips.length).toBe(0);
      expect(value.length).toBe(0);
      act(() => {
        setValue([{ osName: 'RHEL', groupName: 'RHEL 8', value: '8.5' }]);
      });
      const [, chipsUpdated, valueUpdated] = result.current;
      expect(chipsUpdated.length).toBe(1);
      expect(valueUpdated).toEqual([
        {
          osName: 'RHEL',
          osGroup: 'RHEL 8',
          value: '8.5',
        },
      ]);
      expect(chipsUpdated).toMatchSnapshot();
    });

    it('should return empty state value if no versions obtained', () => {
      const wrapper = ({ children }) => (
        <Provider
          store={mockStore({
            entities: {
              operatingSystems: [],
              operatingSystemsLoaded: true,
            },
          })}
        >
          {children}
        </Provider>
      );
      const { result } = renderHook(
        () => useOperatingSystemFilter([], true, true),
        { wrapper }
      );
      expect(result.current).toMatchSnapshot();
    });
  });
});
