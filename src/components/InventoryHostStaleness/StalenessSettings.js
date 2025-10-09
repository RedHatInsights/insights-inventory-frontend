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

const StalenessSettings = ({
  isEditing,
  filter,
  setFilter,
  activeTabKey,
  newFormValues,
  setNewFormValues,
  isFormValid,
  setIsFormValid,
  hostStalenessDefaults,
}) => {
  const dropdownArray = () => [
    systemStalenessItems(),
    systemStalenessWarningItems(),
    systemDeletionItems(),
  ];

  const resetToStandard = () => {
    const defaultsForSelectedTab = hostStalenessDefaults;

    setNewFormValues({ ...newFormValues, ...defaultsForSelectedTab });
  };

  return (
    <React.Fragment>
      <Card isPlain className="pf-v6-u-mb-lg">
        <Flex
          spaceItems={{ default: 'spaceItems2xl' }}
          style={{ minHeight: '110px' }}
        >
          {dropdownArray().map((item) => (
            <FlexItem key={item[0].title}>
              <BaseDropdown
                ouiaId={`${item[0].title.split(' ').map(capitalize).join('')}Dropdown`}
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
                <HostStalenessResetDefaultPopover />
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

StalenessSettings.propTypes = {
  filter: PropTypes.object,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  setFilter: PropTypes.any,
  activeTabKey: PropTypes.number,
  isEditing: PropTypes.bool,
  isFormValid: PropTypes.any,
  setIsFormValid: PropTypes.any,
  defaultValues: PropTypes.object,
  hostStalenessDefaults: PropTypes.object,
};
export default StalenessSettings;
