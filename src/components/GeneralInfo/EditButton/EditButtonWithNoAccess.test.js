import React from 'react';
import { mount } from 'enzyme';
import { PencilAltIcon } from '@patternfly/react-icons';

import EditButton from './EditButton';
import { Tooltip } from '@patternfly/react-core';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    __esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: false }),
  })
);

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

describe('EditButton with no access', () => {
  let onClick;
  let link;

  beforeEach(() => {
    onClick = jest.fn();
    link = 'some-link';
  });

  it('disables with no permission', () => {
    const wrapper = mount(<EditButton onClick={onClick} link={link} />);

    expect(wrapper.find(Tooltip)).toHaveLength(1);
    expect(wrapper.find(PencilAltIcon)).toHaveLength(1);
    expect(wrapper.find('a')).toHaveLength(0);
  });

  it('disables with no permission - write permissions set to false', () => {
    const wrapper = mount(
      <EditButton onClick={onClick} link={link} writePermissions={false} />
    );

    expect(wrapper.find(Tooltip)).toHaveLength(1);
    expect(wrapper.find(PencilAltIcon)).toHaveLength(1);
    expect(wrapper.find('a')).toHaveLength(0);
  });

  it('enables when write permissions are set to true', () => {
    const wrapper = mount(
      <EditButton onClick={onClick} link={link} writePermissions={true} />
    );

    expect(wrapper.find(Tooltip)).toHaveLength(0);
    expect(wrapper.find(PencilAltIcon)).toHaveLength(1);
    expect(wrapper.find('a').props().href).toEqual(
      'http://localhost:5000//some-link'
    );
  });
});
