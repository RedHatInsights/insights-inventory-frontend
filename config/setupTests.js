/* eslint-disable camelcase */
import { configure, mount, render, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import 'whatwg-fetch';

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
