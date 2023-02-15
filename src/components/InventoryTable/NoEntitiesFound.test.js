import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import NoEntitiesFound from './NoEntitiesFound';

describe('NoSystemsTable', () => {
    it('should render correctly - no systems', () => {
        const wrapper = mount(<NoEntitiesFound />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.find('h5').text()).toBe('No matching systems found');
    });

    it('should render correctly - no groups', () => {
        const wrapper = mount(<NoEntitiesFound entities='groups' />);
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.find('h5').text()).toBe('No matching groups found');
    });

    it('renders link if callback provided', () => {
        const wrapper = mount(<NoEntitiesFound onClearAll={() => 42}/>);
        expect(wrapper.find('.pf-m-link').text()).toBe('Clear all filters');
    });
});
