/* eslint-disable camelcase */
import React from 'react';
import { mount } from 'enzyme';

import OperatingSystemFormatter from './OperatingSystemFormatter';

describe('OperatingSystemFormatter', () => {
    let operatingSystem;

    it('should render correctly with RHEL and version', () => {
        operatingSystem = {
            name: 'RHEL',
            major: 7,
            minor: 4
        };

        const wrapper = mount(<OperatingSystemFormatter operatingSystem={operatingSystem}/>);

        expect(wrapper.text()).toEqual('RHEL 7.4');
    });

    it('should render correctly with RHEL and no version', () => {
        operatingSystem = {
            name: 'RHEL',
            major: 7,
            minor: null
        };

        const wrapper = mount(<OperatingSystemFormatter operatingSystem={operatingSystem}/>);

        expect(wrapper.text()).toEqual('RHEL ');
    });

    it('should render with different system', () => {
        operatingSystem = {
            name: 'Windows'
        };

        const wrapper = mount(<OperatingSystemFormatter operatingSystem={operatingSystem}/>);

        expect(wrapper.text()).toEqual('Windows');
    });

    it('missing name', () => {
        operatingSystem = {
            name: null
        };

        const wrapper = mount(<OperatingSystemFormatter operatingSystem={operatingSystem}/>);

        expect(wrapper.text()).toEqual('Not available');
    });

    it('missing operating system', () => {
        operatingSystem = {};

        const wrapper = mount(<OperatingSystemFormatter operatingSystem={operatingSystem}/>);

        expect(wrapper.text()).toEqual('Not available');
    });
});
