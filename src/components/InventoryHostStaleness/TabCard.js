import { Card, Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropDown';
import PropTypes from 'prop-types';
import {
  HostStalenessResetDefaultPopover,
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
  isFormValid,
  setIsFormValid,
}) => {
  const standardValues = {
    system_staleness_delta: '1',
    system_stale_warning_delta: '7',
    system_culling_delta: '14',
    edge_staleness_delta: '2',
    edge_stale_warning_delta: '120',
    edge_culling_delta: '180',
  };
  const dropdownArray = (activeTabKey) => [
    systemStalenessItems(activeTabKey),
    systemStalenessWarningItems(activeTabKey),
    systemCullingItems(activeTabKey),
  ];
  const resetToStandard = () => {
    setNewFormValues(standardValues);
  };

  return (
    <React.Fragment>
      <Card isPlain className="pf-u-mb-lg">
        <Grid span={3}>
          {dropdownArray(activeTabKey).map((item) => (
            <GridItem key={item[0].title}>
              <BaseDropdown
                data-ouia-component-id={item[0].title}
                dropdownItems={item}
                currentItem={newFormValues[item[0].apiKey]}
                disabled={!edit}
                title={item[0].title}
                filter={filter}
                setFilter={setFilter}
                newFormValues={newFormValues}
                setNewFormValues={setNewFormValues}
                edit={edit}
                modalMessage={item[0].modalMessage}
                isFormValid={isFormValid}
                setIsFormValid={setIsFormValid}
              />
            </GridItem>
          ))}
          {edit && (
            <Flex>
              <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
                <a onClick={() => resetToStandard()} className="pf-u-ml-sm ">
                  Reset to default setting
                </a>
                <HostStalenessResetDefaultPopover />
              </FlexItem>
            </Flex>
          )}
        </Grid>
      </Card>
    </React.Fragment>
  );
};

TabCard.propTypes = {
  filter: PropTypes.object,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  setFilter: PropTypes.any,
  activeTabKey: PropTypes.number,
  edit: PropTypes.bool,
  setEdit: PropTypes.any,
  isFormValid: PropTypes.any,
  setIsFormValid: PropTypes.any,
};
export default TabCard;
