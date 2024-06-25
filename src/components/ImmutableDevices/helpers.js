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
  global_danger_color_100,
  global_success_color_100,
  global_warning_color_100,
  global_info_color_100,
  global_active_color_100,
} from '@patternfly/react-tokens';

export const colorMapper = {
  green: global_success_color_100.value,
  yellow: global_warning_color_100.value,
  lightBlue: global_info_color_100.value,
  blue: global_active_color_100.value,
  red: global_danger_color_100.value,
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
