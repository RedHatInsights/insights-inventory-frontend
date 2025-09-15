import moment from 'moment';

export const CUSTOM_LABEL = 'Custom';
export const LAST_SEEN_ID = 'last-seen';
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
    value: { start: undefined, end: undefined },
  },
];

export const isValidISODateStr = (dateStr) => {
  // Date ISO string with or without time
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  return isoRegex.test(dateStr);
};
export const endDateValidator = (minDate) => (date) => {
  const todaysDate = moment().endOf('day');
  const newMinDate = isValidISODateStr(minDate)
    ? moment(minDate).startOf('day')
    : moment('');
  const dateToValidate = moment(date);

  if (dateToValidate < UNIX_EPOCH) {
    return 'Date cannot be earlier than 1970.';
  } else if (newMinDate.isValid() && dateToValidate < newMinDate) {
    return 'End date cannot be earlier than Start date.';
  } else if (dateToValidate > todaysDate) {
    return 'Date cannot be later than today.';
  } else {
    return '';
  }
};

export const startDateValidator = (maxDate) => (date) => {
  const todaysDate = moment().startOf('day');
  const newMaxDate = isValidISODateStr(maxDate)
    ? moment(maxDate).startOf('day')
    : moment('');
  const dateToValidate = moment(date);

  if (dateToValidate < UNIX_EPOCH) {
    return 'Date cannot be earlier than 1970.';
  } else if (newMaxDate.isValid() && dateToValidate > newMaxDate) {
    return 'Start date cannot be later than End date.';
  } else if (dateToValidate > todaysDate) {
    return 'Date cannot be later than today.';
  } else {
    return '';
  }
};

export const isValidDateRange = (start, end) => {
  const startMoment = moment(start).startOf('day');
  const endMoment = moment(end).endOf('day');

  if (!isValidISODateStr(start) || !isValidISODateStr(end)) {
    return false;
  }
  if (!startMoment.isValid() || !endMoment.isValid()) {
    return false;
  }
  if (startMoment > endMoment) {
    return false;
  }

  return true;
};
