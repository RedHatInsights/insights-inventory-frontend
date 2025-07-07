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

export const colorMapper = {
  green: 'var(--pf-t--global--icon--color--status--success--default)',
  yellow: 'var(--pf-t--global--icon--color--status--warning--default)',
  blue: 'var(pf-t--global--icon--color--status--info--default)',
  red: 'var(--pf-t--global--icon--color--status--danger--default)',
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
  dispatcherStatus,
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
