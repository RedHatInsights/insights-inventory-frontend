import { Card, Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropDown';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useState } from 'react';

const TabCard = () => {
  const [edit, setEdit] = useState(false);
  const systemStalenessItems = [
    { name: '1 day', value: '' },
    { name: '2 days', value: 1 },
    { name: '3 days', value: 3 },
    { name: '4 days', value: 4 },
    { name: '5 days', value: 5 },
    { name: '6 days', value: 6 },
    { name: '7 days', value: 7 },
    { name: 'Never', value: 'Never' },
  ];

  const systemStalenessWarningItems = [
    { name: '7 day', value: 7 },
    { name: '14 days', value: 12 },
    { name: '21 days', value: 21 },
    { name: '30 days', value: 20 },
    { name: '60 days', value: 60 },
    { name: '90 days', value: 90 },
    { name: '120 days', value: 120 },
    { name: '150 days', value: 150 },
    { name: '180 days', value: 180 },
    { name: 'Never', value: 'Never' },
  ];
  const systemCullingItems = [
    { name: '14 days', value: 12 },
    { name: '21 days', value: 21 },
    { name: '30 days', value: 20 },
    { name: '60 days', value: 60 },
    { name: '90 days', value: 90 },
    { name: '120 days', value: 120 },
    { name: '150 days', value: 150 },
    { name: '180 days', value: 180 },
    { name: 'Never', value: 'Never' },
  ];
  return (
    <React.Fragment>
      <Card isPlain className="pf-u-mb-lg">
        <Flex className="pf-u-mb-md">
          <p>System Configuration</p>
          <a onClick={() => setEdit(!edit)}>Edit</a>
        </Flex>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <BaseDropdown
            dropdownItems={systemStalenessItems}
            placeholder={'30 days'}
            disabled={!edit}
          />
          <BaseDropdown
            dropdownItems={systemStalenessWarningItems}
            placeholder={'30 days'}
            disabled={!edit}
          />
          <BaseDropdown
            dropdownItems={systemCullingItems}
            placeholder={'30 days'}
            disabled={!edit}
          />
          <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
            <a className="pf-u-ml-sm ">Reset to default setting</a>
            <Tooltip content={'testing testing 123'}>
              <OutlinedQuestionCircleIcon className="pf-u-ml-xs" />
            </Tooltip>
          </FlexItem>
        </Flex>
      </Card>
    </React.Fragment>
  );
};

export default TabCard;
