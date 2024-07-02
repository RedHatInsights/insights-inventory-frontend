import { Button, Card, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropDown';
import PropTypes from 'prop-types';
import {
  HostStalenessResetDefaultPopover,
  systemDeletionItems,
  systemStalenessItems,
  systemStalenessWarningItems,
} from './constants';
import capitalize from 'lodash/capitalize';

const TabCard = ({
  isEditing,
  filter,
  setFilter,
  activeTabKey,
  newFormValues,
  setNewFormValues,
  isFormValid,
  setIsFormValid,
  hostStalenessImmutableDefaults,
  hostStalenessConventionalDefaults,
}) => {
  const dropdownArray = (activeTabKey) => [
    systemStalenessItems(activeTabKey),
    systemStalenessWarningItems(activeTabKey),
    systemDeletionItems(activeTabKey),
  ];

  const resetToStandard = (activeTab) => {
    const defaultsForSelectedTab = activeTab
      ? hostStalenessImmutableDefaults
      : hostStalenessConventionalDefaults;

    setNewFormValues({ ...newFormValues, ...defaultsForSelectedTab });
  };

  return (
    <React.Fragment>
      <Card isPlain className="pf-v5-u-mb-lg">
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          style={{ minHeight: '110px' }}
        >
          {dropdownArray(activeTabKey).map((item) => (
            <FlexItem key={item[0].title}>
              <BaseDropdown
                ouiaId={`${
                  activeTabKey === 0 ? 'Conventional' : 'Immutable'
                }${item[0].title.split(' ').map(capitalize).join('')}Dropdown`}
                dropdownItems={item}
                currentItem={newFormValues[item[0].apiKey]}
                disabled={!isEditing}
                title={item[0].title}
                filter={filter}
                setFilter={setFilter}
                newFormValues={newFormValues}
                setNewFormValues={setNewFormValues}
                isEditing={isEditing}
                modalMessage={item[0].modalMessage}
                isFormValid={isFormValid}
                setIsFormValid={setIsFormValid}
              />
            </FlexItem>
          ))}
          {isEditing ? (
            <Flex alignSelf={{ default: 'alignSelfCenter' }}>
              <FlexItem style={{ width: '200px' }}>
                <Button
                  variant="link"
                  role="button"
                  onClick={() => resetToStandard(activeTabKey)}
                  style={{ padding: '0' }}
                  ouiaId="reset-to-default"
                >
                  Reset to default setting
                </Button>
                <HostStalenessResetDefaultPopover activeTabKey={activeTabKey} />
              </FlexItem>
            </Flex>
          ) : (
            <div style={{ width: '200px' }}></div>
          )}
        </Flex>
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
  isEditing: PropTypes.bool,
  isFormValid: PropTypes.any,
  setIsFormValid: PropTypes.any,
  defaultValues: PropTypes.object,
  hostStalenessImmutableDefaults: PropTypes.object,
  hostStalenessConventionalDefaults: PropTypes.object,
};
export default TabCard;
