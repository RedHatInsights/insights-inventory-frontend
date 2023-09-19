import React from 'react';
import { Button, Flex, FlexItem, Popover, Title } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

export const CONVENTIONAL_TAB_TOOLTIP =
  'With RPM-DNF, you can manage the system software by using the DNF package manager and updated RPM packages. This is a simple and adaptive method of managing and modifying the system over its lifecycle.';

export const IMMUTABLE_TAB_TOOLTIP =
  'With OSTree, you can manage the system software by referencing a central image repository. OSTree images contain a complete operating system ready to be remotely installed at scale.  You can track updates to images through commits and enable secure updates that only address changes and keep the operating system unchanged. The updates are quick, and the rollbacks are easy.';

export const conditionalDropdownError = (
  key,
  newFormValues,
  dropdownItems,
  isFormValid,
  setIsFormValid
) => {
  if (key === 'system_staleness_delta') {
    if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) >
      parseInt(newFormValues['system_stale_warning_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Staleness must be before stale warning
        </p>
      );
    } else if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) >
      parseInt(newFormValues['system_culling_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Staleness must be before culling
        </p>
      );
    } else {
      setIsFormValid(true);
      return <p className="pf-u-font-size-sm ">Maximum days 7</p>;
    }
  }
  if (key === 'system_stale_warning_delta') {
    if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) >
      parseInt(newFormValues['system_culling_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Stale warning must be before culling
        </p>
      );
    } else if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) <
      parseInt(newFormValues['system_staleness_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Stale warning must be after staleness
        </p>
      );
    } else {
      setIsFormValid(true);
      return <p className="pf-u-font-size-sm ">Maximum days 180</p>;
    }
  }
  if (key === 'system_culling_delta') {
    if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) <
      parseInt(newFormValues['system_stale_warning_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Culling must be after staleness
        </p>
      );
    } else if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) <
      parseInt(newFormValues['system_staleness_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Culling must be after stale warning
        </p>
      );
    } else {
      setIsFormValid(true);
    }
  }

  if (key === 'edge_staleness_delta') {
    if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) >
      parseInt(newFormValues['edge_stale_warning_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Staleness must be before stale warning
        </p>
      );
    } else if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) >
      parseInt(newFormValues['edge_culling_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Staleness must be before culling
        </p>
      );
    } else {
      setIsFormValid(true);
      return <p className="pf-u-font-size-sm ">Maximum days 7</p>;
    }
  }
  if (key === 'edge_stale_warning_delta') {
    if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) >
      parseInt(newFormValues['edge_culling_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Stale warning must be before culling
        </p>
      );
    } else if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) <
      parseInt(newFormValues['edge_staleness_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Stale warning must be after staleness
        </p>
      );
    } else {
      setIsFormValid(true);
      return <p className="pf-u-font-size-sm ">Maximum days 180</p>;
    }
  }
  if (key === 'edge_culling_delta') {
    if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) <
      parseInt(newFormValues['edge_stale_warning_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Culling must be after staleness
        </p>
      );
    } else if (
      parseInt(newFormValues[dropdownItems[0].apiKey]) <
      parseInt(newFormValues['edge_staleness_delta'])
    ) {
      setIsFormValid(false);
      return (
        <p className="pf-u-font-size-sm pf-v5-u-danger-color-100">
          Culling must be after stale warning
        </p>
      );
    } else {
      setIsFormValid(true);
    }
  }
};
export const HostStalenessResetDefaultPopover = () => {
  return (
    <Popover
      aria-label="Inventory Groups popover"
      headerContent={
        <Title headingLevel="h4">Orginization level setting</Title>
      }
      position="top"
      bodyContent={
        <Flex
          direction={{ default: 'column' }}
          spaceItems={{ default: 'spaceItemsNone' }}
        >
          <FlexItem>
            {' '}
            <p className="pf-u-font-size-sm">
              - Systems are marked as stale after 1 day since last check-in.
            </p>
          </FlexItem>
          <FlexItem>
            {' '}
            <p className="pf-u-font-size-sm">
              - Systems are marked as stale warning after 14 days since last
              check-in.
            </p>
          </FlexItem>

          <FlexItem>
            {' '}
            <p className="pf-u-font-size-sm">
              - Systems are culled after 30 days since last check-in.
            </p>
          </FlexItem>
        </Flex>
      }
    >
      <Button
        variant="plain"
        aria-label="Open Inventory groups popover"
        style={{ padding: 0 }}
      >
        <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
      </Button>
    </Popover>
  );
};

export const InventoryHostStalenessPopover = () => {
  return (
    <Popover
      aria-label="Inventory Groups popover"
      headerContent={
        <Title headingLevel="h4">Orginization level setting</Title>
      }
      hasAutoWidth
      position="top"
      bodyContent={
        <div>
          <p className="pf-u-font-size-sm">
            Configure the number of days it will take for your systems to be
            marked as stale, stale warning, and be cullled.
          </p>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            <FlexItem>
              <p className="pf-u-font-size-sm">By default:</p>
            </FlexItem>
            <FlexItem>
              <p>
                - Systems are marked as stale after 1 day since last check-in.
              </p>
            </FlexItem>
            <FlexItem>
              {' '}
              <p className="pf-u-font-size-sm">
                - Systems are marked as stale warning after 14 days since last
                check-in.
              </p>{' '}
            </FlexItem>
            <FlexItem>
              {' '}
              <p className="pf-u-font-size-sm">
                - Systems are culled after 30 days since last check-in.
              </p>{' '}
            </FlexItem>
          </Flex>
        </div>
      }
    >
      <Button
        variant="plain"
        aria-label="Open Inventory groups popover"
        style={{ padding: 0 }}
      >
        <OutlinedQuestionCircleIcon className="pf-u-ml-md" />
      </Button>
    </Popover>
  );
};
export const systemStalenessItems = (activeTabKey) => {
  return [
    {
      name: '1 day',
      value: '1',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
      title: 'System staleness',
      modalMessage:
        'A stale status on a system indicates that your system has not checked-in in a certain amount of time.',
    },
    {
      name: '2 days',
      value: '2',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '3 days',
      value: '3',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '4 days',
      value: '4',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '5 days',
      value: '5',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '6 days',
      value: '6',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '7 days',
      value: '7',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: 'Never',
      value: 'Never',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
  ];
};

export const systemStalenessWarningItems = (activeTabKey) => {
  return [
    {
      name: '7 days',
      value: '7',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
      title: 'System stale warning',
      modalMessage:
        'A stale warning status on a system indicates that your system has not checked-in in a while, and is at risk of being deleted from your inventory.',
    },
    {
      name: '14 days',
      value: '14',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: '21 days',
      value: '21',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: '30 days',
      value: '20',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: '60 days',
      value: '60',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: '90 days',
      value: '90',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: '120 days',
      value: '120',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: '150 days',
      value: '150',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: '180 days',
      value: '180',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
    {
      name: 'Never',
      value: 'Never',
      apiKey: activeTabKey
        ? 'edge_stale_warning_delta'
        : 'system_stale_warning_delta',
    },
  ];
};

export const systemCullingItems = (activeTabKey) => {
  return [
    {
      name: '14 days',
      value: '14',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
      title: 'System culling',
      modalMessage:
        'This is the time at which your system will be deleted from your inventory. Once your system is culled, it will have to be re-registered to be added back to your inventory.',
    },
    {
      name: '21 days',
      value: '21',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '30 days',
      value: '30',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '60 days',
      value: '60',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '90 days',
      value: '90',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '120 days',
      value: '120',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '150 days',
      value: '150',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '180 days',
      value: '180',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: 'Never',
      value: 'Never',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
  ];
};
