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
import {
  dangerColor,
  successColor,
  warningColor,
  infoColor,
  activeColor,
} from '@patternfly/react-tokens';

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
    return 'default';
  }
};
