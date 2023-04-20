/* eslint-disable camelcase */
import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import TextInputModal from './TextInputModal';

describe('TextInputModal', () => {

    describe('render', () => {
        it('should render without any props', () => {
            const wrapper = shallow(<TextInputModal />);
            expect(toJson(wrapper)).toMatchSnapshot();
        });

        it('should render open', () => {
            const wrapper = shallow(<TextInputModal isOpen />);
            expect(toJson(wrapper)).toMatchSnapshot();
        });

        it('should render title', () => {
            const wrapper = shallow(<TextInputModal isOpen title='Some title' />);
            expect(toJson(wrapper)).toMatchSnapshot();
        });

        it('should render aria label', () => {
            const wrapper = shallow(<TextInputModal isOpen ariaLabel='Some aria label' />);
            expect(toJson(wrapper)).toMatchSnapshot();
        });
    });

    describe('API', () => {

        it('onCancel should NOT be called', () => {
            const onCancel = jest.fn();
            const wrapper = mount(<TextInputModal isOpen/>);
            wrapper.find('button[data-action="cancel"]').first().simulate('click');
            expect(onCancel).not.toHaveBeenCalled();
        });

        it('onCancel should be called', () => {
            const onCancel = jest.fn();
            const wrapper = mount(<TextInputModal isOpen onCancel={ onCancel }/>);
            wrapper.find('button[data-action="cancel"]').first().simulate('click');
            expect(onCancel).toHaveBeenCalled();
        });

        it('onSubmit should NOT be called', () => {
            const onSubmit = jest.fn();
            const wrapper = mount(<TextInputModal isOpen/>);
            wrapper.find('button[data-action="confirm"]').first().simulate('click');
            expect(onSubmit).not.toHaveBeenCalled();
            expect(toJson(wrapper)).toMatchSnapshot();
        });

        it('onSubmit should NOT be called', () => {
            const onSubmit = jest.fn();
            const wrapper = mount(<TextInputModal isOpen onSubmit={ onSubmit }/>);
            wrapper.find('button[data-action="confirm"]').first().simulate('click');
            expect(onSubmit).toHaveBeenCalled();
        });

        it('X button should call onClose', () => {
            const onCancel = jest.fn();
            const wrapper = mount(<TextInputModal isOpen onCancel={ onCancel } />);
            wrapper.find('button[aria-label="Close"]').first().simulate('click');
            expect(onCancel).toHaveBeenCalled();
        });
    });
});
