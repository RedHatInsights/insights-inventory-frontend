import moment from 'moment';

export const UNIX_EPOCH = moment(0);

export const isValidISODateStr = (dateStr: string) => {
  // Date ISO string with or without time
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  return isoRegex.test(dateStr);
};
export const endDateValidator = (minDate: string) => (date: string) => {
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

export const startDateValidator = (maxDate: string) => (date: string) => {
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

export const isValidDateRange = (start: string, end: string) => {
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
