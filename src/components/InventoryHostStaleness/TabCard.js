import {
  Button,
  Card,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Tooltip,
} from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropDown';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import {
  systemCullingItems,
  systemStalenessItems,
  systemStalenessWarningItems,
} from './constants';

const TabCard = ({
  edit,
  filter,
  setFilter,
  activeTabKey,
  newFormValues,
  setNewFormValues,
}) => {
  const resetToDefault = () => {
    // console.log('blabla 2 here');
  };
  return (
    <React.Fragment>
      <Card isPlain className="pf-u-mb-lg">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <BaseDropdown
            dropdownItems={systemStalenessItems(activeTabKey)}
            currentItem={systemStalenessItems(activeTabKey)[1].name}
            disabled={!edit}
            title={'System staleness'}
            filter={filter}
            setFilter={setFilter}
            newFormValues={newFormValues}
            setNewFormValues={setNewFormValues}
          />
          <BaseDropdown
            dropdownItems={systemStalenessWarningItems(activeTabKey)}
            currentItem={systemStalenessWarningItems(activeTabKey)[2].name}
            disabled={!edit}
            title={'System stale warning'}
            filter={filter}
            setFilter={setFilter}
            newFormValues={newFormValues}
            setNewFormValues={setNewFormValues}
          />
          <BaseDropdown
            dropdownItems={systemCullingItems(activeTabKey)}
            currentItem={systemCullingItems(activeTabKey)[4].name}
            disabled={!edit}
            title={'System culling'}
            filter={filter}
            setFilter={setFilter}
            newFormValues={newFormValues}
            setNewFormValues={setNewFormValues}
          />
          {edit && (
            <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
              <a
                onClick={resetToDefault(setNewFormValues /*, defaultValues*/)}
                className="pf-u-ml-sm "
              >
                Reset to default setting
              </a>
              <Tooltip content={'testing testing 123'}>
                <OutlinedQuestionCircleIcon className="pf-u-ml-xs" />
              </Tooltip>
            </FlexItem>
          )}
        </Flex>
        {edit && (
          <Grid>
            <GridItem span={2}>
              <Button className="pf-u-mt-md" size={'sm'}>
                Update
              </Button>
            </GridItem>
          </Grid>
        )}
      </Card>
    </React.Fragment>
  );
};

TabCard.propTypes = {
  filter: PropTypes.string,
  newFormValues: PropTypes.obj,
  setNewFormValues: PropTypes.any,
  setFilter: PropTypes.any,
  activeTabKey: PropTypes.number,
  edit: PropTypes.bool,
};
export default TabCard;
