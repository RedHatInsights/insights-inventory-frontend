import { configure, mount, render, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import 'whatwg-fetch';

configure({ adapter: new Adapter() });

global.insights = {
    chrome: {
        auth: {
            getUser: () => fetch('/api/entitlements/v1/services').then(res => res.json())
        }
    }
};

global.shallow = shallow;
global.render = render;
global.mount = mount;
global.React = React;
