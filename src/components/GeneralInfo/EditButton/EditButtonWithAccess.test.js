import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { PencilAltIcon } from '@patternfly/react-icons';

import EditButton from './EditButton';
import { Tooltip } from '@patternfly/react-core';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

describe('EditButton with access', () => {
  let onClick;
  let link;

  beforeEach(() => {
    onClick = jest.fn();
    link = 'some-link';
  });

  it('enables with permission', () => {
    const wrapper = mount(<EditButton onClick={onClick} link={link} />);

    expect(wrapper.find(Tooltip)).toHaveLength(0);
    expect(wrapper.find(PencilAltIcon)).toHaveLength(1);
    expect(wrapper.find('a').props().href).toEqual(
      'http://localhost:5000//some-link'
    );
  });

  it('click on link', async () => {
    const wrapper = mount(<EditButton onClick={onClick} link={link} />);

    expect(onClick).not.toHaveBeenCalled();

    await act(async () => {
      wrapper.find('a').simulate('click');
    });

    expect(onClick).toHaveBeenCalled();
  });
});
