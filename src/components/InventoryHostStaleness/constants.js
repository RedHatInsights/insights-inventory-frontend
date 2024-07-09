import React from 'react';
import { Button, Flex, Popover, Title } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

export const CONVENTIONAL_TAB_TOOLTIP =
  'With RPM-DNF, you can manage the system software by using the DNF package manager and updated RPM packages. This is a simple and adaptive method of managing and modifying the system over its lifecycle.';

export const IMMUTABLE_TAB_TOOLTIP =
  'With OSTree, you can manage the system software by referencing a central image repository. OSTree images contain a complete operating system ready to be remotely installed at scale.  You can track updates to images through commits and enable secure updates that only address changes and keep the operating system unchanged. The updates are quick, and the rollbacks are easy.';

export const GENERAL_HOST_STALENESS_WRITE_PERMISSION =
  'staleness:staleness:write';
export const GENERAL_HOST_STALENESS_READ_PERMISSION =
  'staleness:staleness:read';

export const HOST_STALENESS_ADMINISTRATOR_PERMISSIONS = [
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
];

//86400 seconds in one day -> divide each by secodns in a day to get day values
export const secondsToDaysConversion = (seconds) => {
  if (seconds === 104400) {
    return 1;
  } else {
    return seconds / 86400;
  }
};

export const daysToSecondsConversion = (days, filterKey) => {
  //backend requires a buffer specifically for 1 this option
  if (filterKey === 'conventional_time_to_stale' && days === 1) {
    return 104400;
  } else {
    return days * 86400;
  }
};

export const hostStalenessApiKeys = [
  'conventional_time_to_stale',
  'conventional_time_to_stale_warning',
  'conventional_time_to_delete',
  'immutable_time_to_stale',
  'immutable_time_to_stale_warning',
  'immutable_time_to_delete',
];

export const conventionalApiKeys = [
  'conventional_time_to_stale',
  'conventional_time_to_stale_warning',
  'conventional_time_to_delete',
];

export const conditionalDropdownError = (newFormValues, dropdownItems) => {
  //this runs on every select every time
  let apiKey = dropdownItems[0].apiKey;
  let formValue = newFormValues[apiKey];

  if (apiKey === 'conventional_time_to_stale') {
    if (formValue >= newFormValues['conventional_time_to_stale_warning']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before stale warning
        </p>
      );
    } else if (formValue > newFormValues['conventional_time_to_delete']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before deletion
        </p>
      );
    } else {
      return <p className="pf-v5-u-font-size-sm ">Maximum: 7 days</p>;
    }
  }
  if (apiKey === 'conventional_time_to_stale_warning') {
    if (formValue >= newFormValues['conventional_time_to_delete']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be before deletion
        </p>
      );
    } else if (formValue < newFormValues['conventional_time_to_stale']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be after staleness
        </p>
      );
    } else {
      return (
        <p className="pf-v5-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 180 days
        </p>
      );
    }
  }
  if (apiKey === 'conventional_time_to_delete') {
    if (formValue < newFormValues['conventional_time_to_stale_warning']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after staleness
        </p>
      );
    } else if (formValue < newFormValues['conventional_time_to_stale']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after stale warning
        </p>
      );
    } else {
      return (
        <p className="pf-v5-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 2 years
        </p>
      );
    }
  }

  if (apiKey === 'immutable_time_to_stale') {
    if (formValue >= newFormValues['immutable_time_to_stale_warning']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before stale warning
        </p>
      );
    } else if (formValue > newFormValues['immutable_time_to_delete']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before deletion
        </p>
      );
    } else {
      return (
        <p className="pf-v5-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 7 days
        </p>
      );
    }
  }
  if (apiKey === 'immutable_time_to_stale_warning') {
    if (formValue >= newFormValues['immutable_time_to_delete']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100 "
          style={{ width: '200px' }}
        >
          Stale warning must be before deletion
        </p>
      );
    } else if (formValue < newFormValues['immutable_time_to_stale']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be after staleness
        </p>
      );
    } else {
      return (
        <p className="pf-v5-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 180 days
        </p>
      );
    }
  }
  if (apiKey === 'immutable_time_to_delete') {
    if (formValue < newFormValues['immutable_time_to_stale_warning']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after staleness
        </p>
      );
    } else if (formValue < newFormValues['immutable_time_to_stale']) {
      return (
        <p
          className="pf-v5-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after stale warning
        </p>
      );
    } else {
      return (
        <p className="pf-v5-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 2 years
        </p>
      );
    }
  }
};

export const HostStalenessResetDefaultPopover = ({ activeTabKey }) => {
  return (
    <Popover
      aria-label="Organization level popover"
      headerContent={<Title headingLevel="h4">Default settings</Title>}
      position="left"
      bodyContent={
        activeTabKey ? (
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span className="pf-v5-u-font-size-sm">
              - Systems are marked as stale after 2 days since last check-in.
            </span>
            <span className="pf-v5-u-font-size-sm">
              - Systems are marked as stale warning after 180 days since last
              check-in.
            </span>

            <span className="pf-v5-u-font-size-sm">
              - Systems are deleted after 2 years since last check-in.
            </span>
          </Flex>
        ) : (
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span className="pf-v5-u-font-size-sm">
              - Systems are marked as stale after 1 day since last check-in.
            </span>
            <span className="pf-v5-u-font-size-sm">
              - Systems are marked as stale warning after 7 days since last
              check-in.
            </span>

            <span className="pf-v5-u-font-size-sm">
              - Systems are deleted after 14 days since last check-in.
            </span>
          </Flex>
        )
      }
    >
      <Button
        variant="plain"
        aria-label="Organization level popover"
        style={{ padding: 0 }}
      >
        <OutlinedQuestionCircleIcon className="pf-v5-u-ml-md" />
      </Button>
    </Popover>
  );
};

export const InventoryHostStalenessPopover = ({ hasEdgeSystems }) => {
  return (
    <Popover
      aria-label="Organization level popover"
      headerContent={
        <Title headingLevel="h4">Organization level setting</Title>
      }
      hasAutoWidth
      position="top"
      bodyContent={
        <Flex direction={{ default: 'column' }}>
          <p className="pf-v5-u-font-size-sm">
            Configure the number of days it will take for your systems to be
            marked as stale, stale warning, and be deleted.
          </p>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span className="pf-v5-u-font-size-sm">
              Default for Conventional systems (RPM-DNF):
            </span>
            <span className="pf-v5-u-font-size-sm">
              <p>
                - Systems are marked as stale after 1 day since last check-in.
              </p>
            </span>
            <span className="pf-v5-u-font-size-sm">
              - Systems are marked as stale warning after 7 days since last
              check-in.
            </span>
            <span className="pf-v5-u-font-size-sm">
              - Systems are deleted after 14 days since last check-in.
            </span>
          </Flex>
          {hasEdgeSystems && (
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
            >
              <span className="pf-v5-u-font-size-sm">
                Default for Immutable systems (OSTree):
              </span>
              <span className="pf-v5-u-font-size-sm">
                <p>
                  - Systems are marked as stale after 2 days since last
                  check-in.
                </p>
              </span>
              <span className="pf-v5-u-font-size-sm">
                - Systems are marked as stale warning after 180 days since last
                check-in.
              </span>
              <span className="pf-v5-u-font-size-sm">
                - Systems are deleted after 2 years since last check-in.
              </span>
            </Flex>
          )}
        </Flex>
      }
    >
      <Button
        variant="plain"
        aria-label="Organization level popover"
        style={{ padding: 0 }}
      >
        <OutlinedQuestionCircleIcon className="pf-v5-u-ml-sm" />
      </Button>
    </Popover>
  );
};

export const systemStalenessItems = (activeTabKey) => {
  const allDays = [1, 2, 3, 4, 5, 6, 7];
  const apiKey = activeTabKey
    ? 'immutable_time_to_stale'
    : 'conventional_time_to_stale';
  const title = 'System staleness';
  const newItems = allDays.map((value) => ({
    name: value === 1 ? '1 day' : `${value} days`,
    value,
    apiKey,
    title,
  }));
  newItems[0].modalMessage =
    'A stale status on a system indicates that your system has not checked-in in a certain amount of time.';

  return newItems;
};

export const systemStalenessWarningItems = (activeTabKey) => {
  const allDays = [2, 3, 4, 5, 6, 7, 14, 21, 30, 60, 90, 120, 150, 180];
  const apiKey = activeTabKey
    ? 'immutable_time_to_stale_warning'
    : 'conventional_time_to_stale_warning';
  const title = 'System stale warning';
  const newItems = allDays.map((value) => ({
    name: value + ' days',
    value,
    apiKey,
    title,
  }));
  newItems[0].modalMessage =
    'A stale warning status on a system indicates that your system has not checked-in in a while, and is at risk of being deleted from your inventory.';

  return newItems;
};

export const systemDeletionItems = (activeTabKey) => {
  const allDays = [3, 4, 5, 6, 7, 14, 21, 30, 60, 90, 120, 150, 180, 365, 730];
  const apiKey = activeTabKey
    ? 'immutable_time_to_delete'
    : 'conventional_time_to_delete';
  const title = 'System deletion';

  const newItems = allDays.map((value) => ({
    name:
      value < 365
        ? `${value} days`
        : value === 365
        ? `1 year`
        : `${Math.floor(value / 365)} years`,
    value,
    apiKey,
    title,
  }));
  newItems[0].modalMessage =
    'This is the time at which your system will be deleted from your inventory. Once your system is deleted, it will have to be re-registered to be added back to your inventory.';

  return newItems;
};

export const formValidation = async (newFormValues, setIsFormValid) => {
  for (let i = 0; i < hostStalenessApiKeys.length; i++) {
    const apiKey = hostStalenessApiKeys[i];
    let formValue = newFormValues[apiKey];

    if (
      apiKey === 'conventional_time_to_stale' &&
      formValue >= newFormValues['conventional_time_to_stale_warning']
    ) {
      setIsFormValid(false);
      break;
    }
    if (
      apiKey === 'immutable_time_to_stale' &&
      formValue >= newFormValues['immutable_time_to_stale_warning']
    ) {
      setIsFormValid(false);
      break;
    }
    if (
      apiKey === 'conventional_time_to_stale_warning' &&
      formValue >= newFormValues['conventional_time_to_delete']
    ) {
      setIsFormValid(false);
      break;
    }
    if (
      apiKey === 'immutable_time_to_stale_warning' &&
      formValue >= newFormValues['immutable_time_to_delete']
    ) {
      setIsFormValid(false);
      break;
    } else {
      setIsFormValid(true);
    }
  }
};

HostStalenessResetDefaultPopover.propTypes = {
  activeTabKey: PropTypes.number,
};

InventoryHostStalenessPopover.propTypes = {
  hasEdgeSystems: PropTypes.bool,
};
