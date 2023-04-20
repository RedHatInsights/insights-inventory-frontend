/* eslint-disable react/display-name */
import React from 'react';
import TagWithDialog from './TagWithDialog';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';
import { createPromise as promiseMiddleware } from 'redux-promise-middleware';
import toJson from 'enzyme-to-json';
import { Provider } from 'react-redux';

describe('EntityTable', () => {
    let mockStore;
    beforeEach(() => {
        mockStore = configureStore([promiseMiddleware()]);
    });

    describe('DOM', () => {
        it('should render with count', () => {
            const store = mockStore({});
            const wrapper = mount(<Provider store={ store }>
                <TagWithDialog store={store} count={10} />
            </Provider>);
            expect(toJson(wrapper.find('TagWithDialog').first(), { mode: 'shallow' })).toMatchSnapshot();
        });
    });

    describe('API', () => {
        it('should NOT call actions', () => {
            const store = mockStore({});
            const wrapper = mount(<Provider store={ store }>
                <TagWithDialog store={store} count={10} />
            </Provider>);
            wrapper.find('button').first().simulate('click');
            const actions = store.getActions();
            expect(actions.length).toBe(0);
        });

        it('should call actions', () => {
            const store = mockStore({});
            const wrapper = mount(<Provider store={ store }>
                <TagWithDialog store={store} count={10} systemId="something" />
            </Provider>);
            wrapper.find('button').first().simulate('click');
            const actions = store.getActions();
            expect(actions.length).toBe(2);
        });
    });
});
