import React from 'react';
import { mount } from 'enzyme';
import { PencilAltIcon } from '@patternfly/react-icons';

import EditButton from './EditButton';

jest.mock('@redhat-cloud-services/frontend-components-utilities/RBACHook', () => ({
    __esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: false })
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
    __esModule: true,
    default: () => ({
        isProd: () => true
    })
}));

describe('EditButton with no access', () => {
    let onClick;
    let link;

    beforeEach(() => {
        onClick = jest.fn();
        link = 'some-link';
    });

    it('render on production', () => {
        const wrapper = mount(<EditButton
            onClick={onClick}
            link={link}
        />);

        expect(wrapper.find(PencilAltIcon)).toHaveLength(1);
        expect(wrapper.find('a').props().href).toEqual('http://localhost:5000//some-link');
    });
});
