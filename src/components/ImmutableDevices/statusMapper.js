import { colorMapper, iconMapper } from './helpers';

export const statusMapper = {
  booting: {
    text: 'Booting',
    Icon: iconMapper.checkCircle,
    color: colorMapper.green,
    labelColor: 'green',
  },
  building: {
    text: 'Image build in progress',
    Icon: iconMapper.inProgress,
    color: colorMapper.blue,
    labelColor: 'blue',
  },
  created: {
    text: 'Image build in progress',
    Icon: iconMapper.inProgress,
    color: colorMapper.blue,
    labelColor: 'blue',
  },
  upToDate: {
    text: 'Up to date',
    Icon: iconMapper.checkCircle,
    color: colorMapper.green,
    labelColor: 'green',
  },
  success: {
    text: 'Ready',
    Icon: iconMapper.checkCircle,
    color: colorMapper.green,
    labelColor: 'green',
  },
  passed: {
    text: 'Passed',
    Icon: iconMapper.checkCircle,
    color: colorMapper.green,
    labelColor: 'green',
  },
  updateAvailable: {
    text: 'Update available',
    Icon: iconMapper.exclamationTriangle,
    color: colorMapper.yellow,
    labelColor: 'orange',
  },
  updating: {
    text: 'Updating',
    Icon: iconMapper.inProgress,
    color: colorMapper.blue,
    labelColor: 'blue',
  },
  error: {
    text: 'Error',
    Icon: iconMapper.timesCircle,
    color: colorMapper.red,
    labelColor: 'red',
  },
  default: {
    text: 'Unknown',
    Icon: iconMapper.unknown,
  },
  interrupted: {
    text: 'Image build in progress',
    Icon: iconMapper.inProgress,
    color: colorMapper.blue,
    labelColor: 'blue',
  },
  unresponsive: {
    text: 'Unresponsive',
    Icon: iconMapper.exclamationCircle,
    color: colorMapper.red,
    labelColor: 'red',
  },
  errorWithExclamationCircle: {
    text: 'Error',
    Icon: iconMapper.exclamationCircle,
    color: colorMapper.red,
    labelColor: 'red',
  },
};
