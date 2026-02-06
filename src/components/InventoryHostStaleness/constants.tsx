import React from 'react';
import { Staleness } from './HostStalenessCard';

export const GENERAL_HOST_STALENESS_WRITE_PERMISSION =
  'staleness:staleness:write';
export const GENERAL_HOST_STALENESS_READ_PERMISSION =
  'staleness:staleness:read';

export const HOST_STALENESS_ADMINISTRATOR_PERMISSIONS = [
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
];

const DAY_IN_SECONDS = 86400;

//backend requires a buffer specifically for 1 this option
export const secondsToDaysConversion = (seconds: number) => {
  if (seconds === 104400) {
    return 1;
  } else {
    return seconds / DAY_IN_SECONDS;
  }
};

export const daysToSecondsConversion = (
  days: number,
  apiKey: HostStalenessApiKey,
) => {
  //backend requires a buffer specifically for 1 this option
  if (apiKey === 'conventional_time_to_stale' && days === 1) {
    return 104400;
  } else {
    return days * DAY_IN_SECONDS;
  }
};

export const hostStalenessApiKeys = [
  'conventional_time_to_stale',
  'conventional_time_to_stale_warning',
  'conventional_time_to_delete',
] as const;

export type HostStalenessApiKey = (typeof hostStalenessApiKeys)[number];

export const conditionalDropdownError = (
  staleness: Staleness,
  apiKey: HostStalenessApiKey,
) => {
  let formValue = staleness[apiKey];

  if (apiKey === 'conventional_time_to_stale') {
    //@ts-expect-error FIXME factor out undefined values
    if (formValue >= staleness['conventional_time_to_stale_warning']) {
      return (
        <p
          className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before stale warning
        </p>
      );
      //@ts-expect-error FIXME factor out undefined values
    } else if (formValue > staleness['conventional_time_to_delete']) {
      return (
        <p
          className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Staleness must be before deletion
        </p>
      );
    } else {
      return <p className="pf-v6-u-font-size-sm ">Maximum: 7 days</p>;
    }
  }
  if (apiKey === 'conventional_time_to_stale_warning') {
    //@ts-expect-error FIXME factor out undefined values
    if (formValue >= staleness['conventional_time_to_delete']) {
      return (
        <p
          className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be before deletion
        </p>
      );
      //@ts-expect-error FIXME factor out undefined values
    } else if (formValue < staleness['conventional_time_to_stale']) {
      return (
        <p
          className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Stale warning must be after staleness
        </p>
      );
    } else {
      return (
        <p className="pf-v6-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 180 days
        </p>
      );
    }
  }
  if (apiKey === 'conventional_time_to_delete') {
    //@ts-expect-error FIXME factor out undefined values
    if (formValue < staleness['conventional_time_to_stale_warning']) {
      return (
        <p
          className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after staleness
        </p>
      );
      //@ts-expect-error FIXME factor out undefined values
    } else if (formValue < staleness['conventional_time_to_stale']) {
      return (
        <p
          className="pf-v6-u-font-size-sm pf-v6-u-danger-color-100"
          style={{ width: '200px' }}
        >
          Deletion must be after stale warning
        </p>
      );
    } else {
      return (
        <p className="pf-v6-u-font-size-sm " style={{ width: '200px' }}>
          Maximum: 2 years
        </p>
      );
    }
  }
};

export const fields = [
  {
    title: 'System staleness',
    apiKey: 'conventional_time_to_stale',
    items: () => {
      const allDays = [1, 2, 3, 4, 5, 6, 7];
      return allDays.map((value) => ({
        name: value === 1 ? '1 day' : `${value} days`,
        value,
      }));
    },
    modalMessage:
      'A stale status on a system indicates that your system has not checked-in in a certain amount of time.',
  },
  {
    title: 'System stale warning',
    apiKey: 'conventional_time_to_stale_warning',
    items: () => {
      const allDays = [2, 3, 4, 5, 6, 7, 14, 21, 30, 60, 90, 120, 150, 180];
      return allDays.map((value) => ({
        name: `${value} days`,
        value,
      }));
    },
    modalMessage:
      'A stale warning status on a system indicates that your system has not checked-in in a while, and is at risk of being deleted from your inventory.',
  },
  {
    title: 'System deletion',
    apiKey: 'conventional_time_to_delete',
    items: () => {
      const allDays = [
        3, 4, 5, 6, 7, 14, 21, 30, 60, 90, 120, 150, 180, 365, 730,
      ];
      return allDays.map((value) => ({
        name:
          value < 365
            ? `${value} days`
            : value === 365
              ? `1 year`
              : `${Math.floor(value / 365)} years`,
        value,
      }));
    },
    modalMessage:
      'This is the time at which your system will be deleted from your inventory. Once your system is deleted, it will have to be re-registered to be added back to your inventory.',
  },
] as const;

export const formValidation = (
  staleness: Staleness,
  setIsFormValid: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  for (let i = 0; i < hostStalenessApiKeys.length; i++) {
    const apiKey = hostStalenessApiKeys[i];
    const formValue = staleness[apiKey];

    if (
      apiKey === 'conventional_time_to_stale' &&
      //@ts-expect-error FIXME factor out undefined values
      formValue >= staleness['conventional_time_to_stale_warning']
    ) {
      setIsFormValid(false);
      break;
    }
    if (
      apiKey === 'conventional_time_to_stale_warning' &&
      //@ts-expect-error FIXME factor out undefined values
      formValue >= staleness['conventional_time_to_delete']
    ) {
      setIsFormValid(false);
      break;
    } else {
      setIsFormValid(true);
    }
  }
};
