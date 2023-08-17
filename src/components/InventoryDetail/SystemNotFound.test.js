import React from 'react';
import toJson from 'enzyme-to-json';
import SystemNotFound from './SystemNotFound';
import { mountWithRouter } from '../../Utilities/TestingUtilities';
//import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate',
  () => () => jest.fn()
);
describe('EntityTable', () => {
  describe('DOM', () => {
    it('should render correctly', () => {
      const wrapper = mountWithRouter(<SystemNotFound />);
      expect(toJson(wrapper)).toMatchSnapshot();
    });

    it('should render correctly with inv ID', () => {
      const wrapper = mountWithRouter(
        <SystemNotFound inventoryId="something" />
      );
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('API', () => {
    const replace = jest.fn();
    const back = jest.fn();
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          pathname: {
            replace,
          },
          href: '',
        },
      });

      Object.defineProperty(window, 'history', {
        writable: true,
        value: {
          back,
        },
      });
    });

    it('should call location replace correctly', () => {
      const onBackToListClick = jest.fn();
      const wrapper = mountWithRouter(
        <SystemNotFound inventoryId="something" />
      );
      wrapper.find('button').first().simulate('click');
      expect(onBackToListClick).not.toHaveBeenCalled();
      expect(replace).toHaveBeenCalled();
    });

    // it('should call history correctly', () => {
    //   Object.defineProperty(document, 'referrer', {
    //     writable: true,
    //     value: true,
    //   });
    //   const onBackToListClick = jest.fn();
    //   const wrapper = mountWithRouter(
    //     <SystemNotFound inventoryId="something" />
    //   );
    //   wrapper.find('button').first().simulate('click');
    //   expect(onBackToListClick).not.toHaveBeenCalled();
    // });

    it('should call onBackToListClick correctly', () => {
      const onBackToListClick = jest.fn();
      const wrapper = mountWithRouter(
        <SystemNotFound
          inventoryId="something"
          onBackToListClick={onBackToListClick}
        />
      );
      wrapper.find('button').first().simulate('click');
      expect(onBackToListClick).toHaveBeenCalled();
    });
  });
});
