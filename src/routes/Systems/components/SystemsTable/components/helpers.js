import moment from 'moment';

export const CUSTOM_LABEL = 'Custom';
export const UNIX_EPOCH = moment(0);
export const LAST_SEEN_OPTIONS = [
  {
    label: 'Within the last 24 hours',
    value: {
      start: moment().subtract(1, 'days').toISOString(),
      end: moment().toISOString(),
    },
  },
  {
    label: 'More than 1 day ago',
    value: {
      end: moment().subtract(1, 'days').toISOString(),
    },
  },
  {
    label: 'More than 7 days ago',
    value: {
      end: moment().subtract(7, 'days').toISOString(),
    },
  },
  {
    label: 'More than 15 days ago',
    value: {
      end: moment().subtract(15, 'days').toISOString(),
    },
  },
  {
    label: 'More than 30 days ago',
    value: {
      end: moment().subtract(30, 'days').toISOString(),
    },
  },
  {
    label: CUSTOM_LABEL,
    value: {},
  },
];

export const isValidISODateStr = (dateStr) => {
  // Date ISO string format (with or without time)
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoRegex.test(dateStr);
};
