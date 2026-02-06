import { Button, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';
import BaseDropdown from './BaseDropdown';
import { fields } from './constants';
import capitalize from 'lodash/capitalize';
import type { Staleness } from './HostStalenessCard';
import { HostStalenessResetPopover } from './HostStalenessResetPopover';

interface StalenessSettingsProps {
  staleness: Staleness;
  setStaleness: React.Dispatch<React.SetStateAction<Staleness>>;
  isEditing: boolean;
  isFormValid: boolean;
  setIsFormValid: React.Dispatch<React.SetStateAction<boolean>>;
  defaultStaleness: Staleness;
  setIsResetToDefault: React.Dispatch<React.SetStateAction<boolean>>;
}

const HostStalenessSettings = ({
  isEditing,
  staleness,
  setStaleness,
  isFormValid,
  setIsFormValid,
  defaultStaleness: defaultStaleness,
  setIsResetToDefault,
}: StalenessSettingsProps) => {
  const resetToStandard = () => {
    const defaultsForSelectedTab = defaultStaleness;

    setStaleness({ ...staleness, ...defaultsForSelectedTab });
    setIsResetToDefault(true);
  };

  return (
    <React.Fragment>
      <Flex spaceItems={{ default: 'spaceItems2xl' }} className="pf-v6-u-mb-xl">
        {fields.map((field) => (
          <FlexItem key={field.title}>
            <BaseDropdown
              ouiaId={`${field.title.split(' ').map(capitalize).join('')}Dropdown`}
              items={field.items()}
              apiKey={field.apiKey}
              currentItem={staleness[field.apiKey]}
              isDisabled={!isEditing}
              title={field.title}
              staleness={staleness}
              setStaleness={setStaleness}
              modalMessage={field.modalMessage}
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
                onClick={() => resetToStandard()}
                style={{ padding: '0' }}
                ouiaId="reset-to-default"
              >
                Reset to default setting
              </Button>
              <HostStalenessResetPopover />
            </FlexItem>
          </Flex>
        ) : (
          <div style={{ width: '200px' }}></div>
        )}
      </Flex>
    </React.Fragment>
  );
};

export default HostStalenessSettings;
