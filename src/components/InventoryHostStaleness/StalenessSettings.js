import { Button, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropdown';
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
  setIsResetToDefault,
}) => {
  const dropdownArray = () => [
    systemStalenessItems(),
    systemStalenessWarningItems(),
    systemDeletionItems(),
  ];

  const resetToStandard = () => {
    const defaultsForSelectedTab = hostStalenessDefaults;

    setNewFormValues({ ...newFormValues, ...defaultsForSelectedTab });
    setIsResetToDefault(true);
  };

  return (
    <React.Fragment>
      <Flex spaceItems={{ default: 'spaceItems2xl' }} className="pf-v6-u-mb-xl">
        {dropdownArray().map((item) => (
          <FlexItem key={item[0].title}>
            <BaseDropdown
              ouiaId={`${item[0].title.split(' ').map(capitalize).join('')}Dropdown`}
              dropdownItems={item}
              currentItem={newFormValues[item[0].apiKey]}
              isDisabled={!isEditing}
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
    </React.Fragment>
  );
};

StalenessSettings.propTypes = {
  filter: PropTypes.object,
  newFormValues: PropTypes.object,
  setNewFormValues: PropTypes.func,
  setFilter: PropTypes.func,
  activeTabKey: PropTypes.number,
  isEditing: PropTypes.bool,
  isFormValid: PropTypes.bool,
  setIsFormValid: PropTypes.func,
  defaultValues: PropTypes.object,
  hostStalenessDefaults: PropTypes.object,
  setIsResetToDefault: PropTypes.func,
};
export default StalenessSettings;
