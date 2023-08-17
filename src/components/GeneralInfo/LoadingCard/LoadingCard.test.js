import React from 'react';
import toJson from 'enzyme-to-json';
import LoadingCard, { Clickable } from './LoadingCard';
import { mountWithRouter } from '../../../Utilities/TestingUtilities';
//import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
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
      const wrapper = mountWithRouter(
        <LoadingCard
          isLoading={isLoading}
          title={`Card that is ${isLoading ? 'loading' : 'loaded'}`}
        />
      );
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  it('should render loading bars', () => {
    const wrapper = mountWithRouter(
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
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it(`Loading card render`, () => {
    const wrapper = mountWithRouter(
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
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('Clickable should render - no data', () => {
    const wrapper = mountWithRouter(<Clickable onClick={jest.fn()} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  describe('none/not available', () => {
    it(`should not be clickable when the value is 0`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('None');
      expect(wrapper.find(Clickable)).toHaveLength(0);
    });

    it(`should not be clickable when the value is 0 with plural`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('0 systems');
      expect(wrapper.find(Clickable)).toHaveLength(0);
    });

    it(`should not be clickable when the value is undefined`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('Not available');
      expect(wrapper.find(Clickable)).toHaveLength(0);
    });

    it(`should be none when value is 0`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('None');
      expect(wrapper.find(Clickable)).toHaveLength(0);
    });

    it(`should be not available when value is undefined`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('Not available');
      expect(wrapper.find(Clickable)).toHaveLength(0);
    });

    it(`plurazied none`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('0 systems');
      expect(wrapper.find(Clickable)).toHaveLength(0);
    });

    it(`should be clickable with plural`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('23 systems');
      expect(wrapper.find(Clickable).find('a')).toHaveLength(1);
    });

    it(`should be clickable with custom plural`, () => {
      const wrapper = mountWithRouter(
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

      expect(wrapper.find('dd').text()).toEqual('23 processes');
      expect(wrapper.find(Clickable).find('a')).toHaveLength(1);
    });
  });

  // it('Clickable should render', () => {
  //   const navigate = useInsightsNavigate();
  //   const wrapper = mountWithRouter(
  //     <Clickable value="15" target="some-target" />
  //   );
  //   wrapper
  //     .find('a')
  //     .first()
  //     .simulate('click', {
  //       preventDefault: () => {},
  //     });
  //   expect(navigate).toHaveBeenCalled();
  //   expect(toJson(wrapper)).toMatchSnapshot();
  // });

  it('clickable should click', () => {
    const onClick = jest.fn();
    const wrapper = mountWithRouter(
      <Clickable onClick={onClick} value="15" target="path" />,
      'http://localhost:5000/inventoryId/modalId'
    );
    wrapper
      .find('a')
      .first()
      .simulate('click', {
        preventDefault: () => {},
      });
    expect(onClick).toHaveBeenCalled();
  });

  it('Clickable should render - 0 value', () => {
    const onClick = jest.fn();
    const wrapper = mountWithRouter(
      <Clickable onClick={onClick} value={0} target="some-target" />
    );
    expect(onClick).not.toHaveBeenCalled();
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
