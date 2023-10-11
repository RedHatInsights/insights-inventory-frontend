import React from 'react';
import {
  CheckCircleIcon,
  CubeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  ModuleIcon,
  PlusCircleIcon,
  QuestionCircleIcon,
  RepositoryIcon,
  SearchIcon,
  TimesCircleIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import dangerColor from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
import warningColor from '@patternfly/react-tokens/dist/esm/global_warning_color_100';
import successColor from '@patternfly/react-tokens/dist/esm/global_success_color_100';
import infoColor from '@patternfly/react-tokens/dist/esm/global_info_color_100';
import activeColor from '@patternfly/react-tokens/dist/esm/global_active_color_100';
import Status from './Status';

export const colorMapper = {
  green: successColor.value,
  yellow: warningColor.value,
  lightBlue: infoColor.value,
  blue: activeColor.value,
  red: dangerColor.value,
};

export const iconMapper = {
  unknown: UnknownIcon,
  repository: RepositoryIcon,
  search: SearchIcon,
  module: ModuleIcon,
  cube: CubeIcon,
  question: QuestionCircleIcon,
  plus: PlusCircleIcon,
  checkCircle: CheckCircleIcon,
  exclamationTriangle: ExclamationTriangleIcon,
  timesCircle: TimesCircleIcon,
  inProgress: InProgressIcon,
  exclamationCircle: ExclamationCircleIcon,
};

export const getDeviceStatus = (
  deviceStatus,
  isUpdateAvailable,
  dispatcherStatus
) => {
  if (dispatcherStatus === 'ERROR') {
    return 'error';
  }

  if (dispatcherStatus === 'UNRESPONSIVE') {
    return 'unresponsive';
  }

  if (deviceStatus === 'UPDATING') {
    return 'updating';
  }

  if (isUpdateAvailable) {
    return 'updateAvailable';
  } else {
    return 'upToDate';
  }
};

export const edgeColumns = [
  {
    key: 'ImageName',
    title: 'Image',
    sort: false,
    renderFunc: (imageName, uuid) => {
      return <a href={`/edge/inventory/${uuid}`}>{imageName}</a>;
    },
    props: { isStatic: true },
  },
  {
    key: 'Status',
    title: 'Status',
    sort: false,
    renderFunc: (
      StatusText,
      DEVICE_ID,
      { UpdateAvailable, DispatcherStatus }
    ) => {
      const deviceStatus = getDeviceStatus(
        StatusText,
        UpdateAvailable,
        DispatcherStatus
      );

      return deviceStatus === 'error' || deviceStatus === 'unresponsive' ? (
        <Status
          type={
            deviceStatus === 'error'
              ? 'errorWithExclamationCircle'
              : deviceStatus
          }
          isLink={true}
        />
      ) : (
        <Status
          type={
            deviceStatus === 'error'
              ? 'errorWithExclamationCircle'
              : deviceStatus
          }
        />
      );
    },
  },
];
