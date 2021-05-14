/* eslint-disable camelcase */
import { configure, mount, render, shallow } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import React from 'react';
import 'whatwg-fetch';
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useLayoutEffect: jest.requireActual('react').useEffect
}));

configure({ adapter: new Adapter() });

global.insights = {
    chrome: {
        auth: {
            getUser: () => Promise.resolve({
                identity: {
                    account_number: '0',
                    type: 'User',
                    user: {
                        is_org_admin: true
                    }
                },
                entitlements: {
                    hybrid_cloud: { is_entitled: true },
                    insights: { is_entitled: true },
                    openshift: { is_entitled: true },
                    smart_management: { is_entitled: false }
                }
            })
        },
        appAction: jest.fn(),
        appObjectId: jest.fn(),
        on: jest.fn(),
        getUserPermissions: () => Promise.resolve(['inventory:*:*'])
    }
};

global.shallow = shallow;
global.render = render;
global.mount = mount;
global.React = React;
