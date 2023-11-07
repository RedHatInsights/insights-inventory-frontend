import React from 'react';
import { Button, Flex, Popover, Title } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

export const CONVENTIONAL_TAB_TOOLTIP =
  'With RPM-DNF, you can manage the system software by using the DNF package manager and updated RPM packages. This is a simple and adaptive method of managing and modifying the system over its lifecycle.';

export const IMMUTABLE_TAB_TOOLTIP =
  'With OSTree, you can manage the system software by referencing a central image repository. OSTree images contain a complete operating system ready to be remotely installed at scale.  You can track updates to images through commits and enable secure updates that only address changes and keep the operating system unchanged. The updates are quick, and the rollbacks are easy.';

export const GENERAL_HOST_STALENESS_WRITE_PERMISSION =
  'inventory:staleness:write';
export const GENERAL_HOST_STALENESS_READ_PERMISSION =
  'inventory:staleness:read';

export const HOST_STALENESS_ADMINISTRATOR_PERMISSIONS = [
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
];

//86400 seconds in one day -> divide each by secodns in a day to get day values
export const secondsToDaysConversion = (seconds) => {
  return seconds / 86400;
};

export const hostStalenessApiKeys = [
  'conventional_staleness_delta',
  'conventional_stale_warning_delta',
  'conventional_culling_delta',
  'immutable_staleness_delta',
  'immutable_stale_warning_delta',
  'immutable_culling_delta',
];

export const conventionalApiKeys = [
  'conventional_staleness_delta',
  'conventional_stale_warning_delta',
  'conventional_culling_delta',
];

export const daysToSecondsConversion = (days) => {
  return days * 86400;
};

export const conditionalDropdownError = (newFormValues, dropdownItems) => {
  //this runs on every select every time
  let apiKey = dropdownItems[0].apiKey;
  let formValue = newFormValues[apiKey];

  if (apiKey === 'conventional_staleness_delta') {
    if (formValue > newFormValues['conventional_stale_warning_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before stale warning
        </p>
      );
    } else if (formValue > newFormValues['conventional_culling_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before deletion
        </p>
      );
    } else {
      return <p className="pf-u-font-size-sm ">Maximum: 7 days</p>;
    }
  }
  if (apiKey === 'conventional_stale_warning_delta') {
    if (formValue > newFormValues['conventional_culling_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be before deletion
        </p>
      );
    } else if (formValue < newFormValues['conventional_staleness_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be after staleness
        </p>
      );
    } else {
      return (
        <p className="pf-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 180 days
        </p>
      );
    }
  }
  if (apiKey === 'conventional_culling_delta') {
    if (formValue < newFormValues['conventional_stale_warning_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after staleness
        </p>
      );
    } else if (formValue < newFormValues['conventional_staleness_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after stale warning
        </p>
      );
    } else {
      return (
        <p className="pf-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 2 years
        </p>
      );
    }
  }

  if (apiKey === 'immutable_staleness_delta') {
    if (formValue > newFormValues['immutable_stale_warning_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before stale warning
        </p>
      );
    } else if (formValue > newFormValues['immutable_culling_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before deletion
        </p>
      );
    } else {
      return (
        <p className="pf-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 7 days
        </p>
      );
    }
  }
  if (apiKey === 'immutable_stale_warning_delta') {
    if (formValue > newFormValues['immutable_culling_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100 "
          style={{ width: '200px' }}
        >
          Stale warning must be before deletion
        </p>
      );
    } else if (formValue < newFormValues['immutable_staleness_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be after staleness
        </p>
      );
    } else {
      return (
        <p className="pf-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 180 days
        </p>
      );
    }
  }
  if (apiKey === 'immutable_culling_delta') {
    if (formValue < newFormValues['immutable_stale_warning_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after staleness
        </p>
      );
    } else if (formValue < newFormValues['immutable_staleness_delta']) {
      return (
        <p
          className="pf-u-font-size-sm pf-v5-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after stale warning
        </p>
      );
    } else {
      return (
        <p className="pf-u-font-size-sm " style={{ width: '200px' }}>
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
            <span className="pf-u-font-size-sm">
              - Systems are marked as stale after 2 days since last check-in.
            </span>
            <span className="pf-u-font-size-sm">
              - Systems are marked as stale warning after 120 days since last
              check-in.
            </span>

            <span className="pf-u-font-size-sm">
              - Systems are deleted after 180 days since last check-in.
            </span>
          </Flex>
        ) : (
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span className="pf-u-font-size-sm">
              - Systems are marked as stale after 1 day since last check-in.
            </span>
            <span className="pf-u-font-size-sm">
              - Systems are marked as stale warning after 7 days since last
              check-in.
            </span>

            <span className="pf-u-font-size-sm">
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
        <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
      </Button>
    </Popover>
  );
};

export const InventoryHostStalenessPopover = ({ hasEdgeSystems }) => {
  return (
    <Popover
      aria-label="Orginization level popover"
      headerContent={
        <Title headingLevel="h4">Orginization level setting</Title>
      }
      hasAutoWidth
      position="top"
      bodyContent={
        <Flex direction={{ default: 'column' }}>
          <p className="pf-u-font-size-sm">
            Configure the number of days it will take for your systems to be
            marked as stale, stale warning, and be deleted.
          </p>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <span className="pf-u-font-size-sm">
              Default for Conventional systems (RPM-DNF):
            </span>
            <span className="pf-u-font-size-sm">
              <p>
                - Systems are marked as stale after 1 day since last check-in.
              </p>
            </span>
            <span className="pf-u-font-size-sm">
              - Systems are marked as stale warning after 7 days since last
              check-in.
            </span>
            <span className="pf-u-font-size-sm">
              - Systems are deleted after 14 days since last check-in.
            </span>
          </Flex>
          {hasEdgeSystems && (
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsNone' }}
            >
              <span className="pf-u-font-size-sm">
                Default for Immutable systems (OSTree):
              </span>
              <span className="pf-u-font-size-sm">
                <p>
                  - Systems are marked as stale after 2 days since last
                  check-in.
                </p>
              </span>
              <span className="pf-u-font-size-sm">
                - Systems are marked as stale warning after 120 days since last
                check-in.
              </span>
              <span className="pf-u-font-size-sm">
                - Systems are deleted after 180 days since last check-in.
              </span>
            </Flex>
          )}
        </Flex>
      }
    >
      <Button
        variant="plain"
        aria-label="Orginization level popover"
        style={{ padding: 0 }}
      >
        <OutlinedQuestionCircleIcon className="pf-u-ml-sm" />
      </Button>
    </Popover>
  );
};

export const systemStalenessItems = (activeTabKey) => {
  return [
    {
      name: '1 day',
      value: 1,
      apiKey: activeTabKey
        ? 'immutable_staleness_delta'
        : 'conventional_staleness_delta',
      title: 'System staleness',
      modalMessage:
        'A stale status on a system indicates that your system has not checked-in in a certain amount of time.',
    },
    {
      name: '2 days',
      value: 2,
      apiKey: activeTabKey
        ? 'immutable_staleness_delta'
        : 'conventional_staleness_delta',
    },
    {
      name: '3 days',
      value: 3,
      apiKey: activeTabKey
        ? 'immutable_staleness_delta'
        : 'conventional_staleness_delta',
    },
    {
      name: '4 days',
      value: 4,
      apiKey: activeTabKey
        ? 'immutable_staleness_delta'
        : 'conventional_staleness_delta',
    },
    {
      name: '5 days',
      value: 5,
      apiKey: activeTabKey
        ? 'immutable_staleness_delta'
        : 'conventional_staleness_delta',
    },
    {
      name: '6 days',
      value: 6,
      apiKey: activeTabKey
        ? 'immutable_staleness_delta'
        : 'conventional_staleness_delta',
    },
    {
      name: '7 days',
      value: 7,
      apiKey: activeTabKey
        ? 'immutable_staleness_delta'
        : 'conventional_staleness_delta',
    },
  ];
};

export const systemStalenessWarningItems = (activeTabKey) => {
  return [
    {
      name: '7 days',
      value: 7,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
      title: 'System stale warning',
      modalMessage:
        'A stale warning status on a system indicates that your system has not checked-in in a while, and is at risk of being deleted from your inventory.',
    },
    {
      name: '14 days',
      value: 14,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
    {
      name: '21 days',
      value: 21,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
    {
      name: '30 days',
      value: 30,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
    {
      name: '60 days',
      value: 60,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
    {
      name: '90 days',
      value: 90,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
    {
      name: '120 days',
      value: 120,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
    {
      name: '150 days',
      value: 150,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
    {
      name: '180 days',
      value: 180,
      apiKey: activeTabKey
        ? 'immutable_stale_warning_delta'
        : 'conventional_stale_warning_delta',
    },
  ];
};

export const systemDeletionItems = (activeTabKey) => {
  return [
    {
      name: '14 days',
      value: 14,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
      title: 'System deletion',
      modalMessage:
        'This is the time at which your system will be deleted from your inventory. Once your system is deleted, it will have to be re-registered to be added back to your inventory.',
    },
    {
      name: '21 days',
      value: 21,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '30 days',
      value: 30,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '60 days',
      value: 60,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '90 days',
      value: 90,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '120 days',
      value: 120,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '150 days',
      value: 150,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '180 days',
      value: 180,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '1 year',
      value: 365,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
    {
      name: '2 years',
      value: 730,
      apiKey: activeTabKey
        ? 'immutable_culling_delta'
        : 'conventional_culling_delta',
    },
  ];
};

export const formValidation = async (newFormValues, setIsFormValid) => {
  for (let i = 0; i < hostStalenessApiKeys.length; i++) {
    const apiKey = hostStalenessApiKeys[i];
    let formValue = newFormValues[apiKey];

    if (
      apiKey === 'conventional_staleness_delta' &&
      formValue > newFormValues['conventional_stale_warning_delta']
    ) {
      setIsFormValid(false);
      break;
    }
    if (
      apiKey === 'immutable_staleness_delta' &&
      formValue > newFormValues['immutable_stale_warning_delta']
    ) {
      setIsFormValid(false);
      break;
    }
    if (
      apiKey === 'conventional_stale_warning_delta' &&
      formValue > newFormValues['conventional_culling_delta']
    ) {
      setIsFormValid(false);
      break;
    }
    if (
      apiKey === 'immutable_stale_warning_delta' &&
      formValue > newFormValues['immutable_culling_delta']
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
