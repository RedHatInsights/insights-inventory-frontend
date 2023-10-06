export const availableVersions = [
  {
    groupLabel: 'RHEL 6',
    label: 'RHEL 6.9',
    osName: 'RHEL',
    value: '6.9',
  },
  {
    groupLabel: 'RHEL 6',
    label: 'RHEL 6.10',
    osName: 'RHEL',
    value: '6.10',
  },
  {
    groupLabel: 'RHEL 7',
    label: 'RHEL 7.0',
    osName: 'RHEL',
    value: '7.0',
  },
  {
    groupLabel: 'RHEL 8',
    label: 'RHEL 8.5',
    osName: 'RHEL',
    value: '8.5',
  },
  {
    groupLabel: 'RHEL 8',
    label: 'RHEL 8.10',
    osName: 'RHEL',
    value: '8.10',
  },
  {
    groupLabel: 'CentOS Linux 7',
    label: 'CentOS Linux 7.9',
    osName: 'CentOS Linux',
    value: '7.9',
  },
  {
    groupLabel: 'CentOS Linux 8',
    label: 'CentOS Linux 8.6',
    osName: 'CentOS Linux',
    value: '8.6',
  },
];

export const testValue1 = {
  'RHEL 7': {
    'RHEL 7': true,
    '7.0': true,
    7.1: true,
    7.2: true,
  },
  'RHEL 8': {
    'RHEL 8': true,
    8.5: true,
    '8.10': true,
  },
  'RHEL 9': {
    'RHEL 9': true,
    9.1: true,
  },
  'CentOS Linux 7': {
    'CentOS Linux 7': true,
    7.6: true,
    7.9: true,
  },
  'CentOS Linux 8': {
    'CentOS Linux 8': true,
    8.3: true,
    8.9: true,
  },
};

/*eslint-disable prettier/prettier*/
export const testValue2 = {
  'RHEL 6': {
    'RHEL 6': false,
    '6.9': true,
    '6.10': false,
  },
  'RHEL 7': {
    'RHEL 7': true,
    '7.0': true,
  },
  'RHEL 8': {
    'RHEL 8': true,
    '8.5': true,
    '8.10': true,
  },
  'CentOS Linux 7': {
    'CentOS Linux 7': true,
    '7.9': true,
  },
  'CentOS Linux 8': {
    'CentOS Linux 8': false,
    '8.6': false,
  },
};

export const testValue3 = {
  'RHEL 6': {
    'RHEL 6': false,
    '6.9': false,
    '6.10': false,
  },
  'RHEL 7': {
    'RHEL 7': false,
    '7.0': false,
  },
  'RHEL 8': {
    'RHEL 8': false,
    '8.5': false,
    '8.10': false,
  },
  'CentOS Linux 7': {
    'CentOS Linux 7': false,
    '7.9': false,
  },
  'CentOS Linux 8': {
    'CentOS Linux 8': false,
    '8.6': false,
  },
};

export const testValue4 = {
  'RHEL 6': {
    'RHEL 6': false,
    '6.9': false,
    '6.10': false,
  },
  'RHEL 7': {
    'RHEL 7': false,
    '7.0': false,
  },
  'RHEL 8': {
    'RHEL 8': true,
    '8.5': true,
    '8.10': true,
  },
  'CentOS Linux 7': {
    'CentOS Linux 7': false,
    '7.9': false,
  },
  'CentOS Linux 8': {
    'CentOS Linux 8': false,
    '8.6': false,
  },
};
/*eslint-enable prettier/prettier*/

export const groupSelection1 = [
  { osName: 'RHEL', osGroup: 'RHEL 7', value: '7.0' },
  { osName: 'RHEL', osGroup: 'RHEL 7', value: '7.1' },
  { osName: 'RHEL', osGroup: 'RHEL 7', value: '7.2' },
  { osName: 'RHEL', osGroup: 'RHEL 8', value: '8.5' },
  { osName: 'RHEL', osGroup: 'RHEL 8', value: '8.10' },
  { osName: 'RHEL', osGroup: 'RHEL 9', value: '9.1' },
  { osName: 'CentOS Linux', osGroup: 'CentOS Linux 7', value: '7.6' },
  { osName: 'CentOS Linux', osGroup: 'CentOS Linux 7', value: '7.9' },
  { osName: 'CentOS Linux', osGroup: 'CentOS Linux 8', value: '8.3' },
  { osName: 'CentOS Linux', osGroup: 'CentOS Linux 8', value: '8.9' },
];

export const groupSelection2 = [
  { osName: 'RHEL', osGroup: 'RHEL 6', value: '6.9' },
  { osName: 'RHEL', osGroup: 'RHEL 7', value: '7.0' },
  { osName: 'RHEL', osGroup: 'RHEL 8', value: '8.5' },
  { osName: 'RHEL', osGroup: 'RHEL 8', value: '8.10' },
  { osName: 'CentOS Linux', osGroup: 'CentOS Linux 7', value: '7.9' },
];
