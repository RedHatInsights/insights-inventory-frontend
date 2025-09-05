import React, { useState } from 'react';
import { Flex, FlexItem, DatePicker, SplitItem } from '@patternfly/react-core';
import { UNIX_EPOCH, isValidISODateStr } from './helpers';
import moment from 'moment';
import PropTypes from 'prop-types';

const DateRangeSelector = ({ dateRange, setDateRange }) => {
  const [startDate, setStartDate] = useState(dateRange?.start);
  const [endDate, setEndDate] = useState(dateRange?.end);

  const toValidator = (minDate) => (date) => {
    const todaysDate = moment().endOf('day');
    const dateToValidate = moment(date);
    const newMinDate = moment(minDate).startOf('day');

    if (dateToValidate < newMinDate) {
      return 'Start date must be earlier than End date.';
    } else if (dateToValidate > todaysDate) {
      return `Date must be ${todaysDate.toISOString().split('T')[0]} or earlier`;
    } else {
      return '';
    }
  };

  const fromValidator = (maxDate) => (date) => {
    const todaysDate = moment().startOf('day');
    const newMaxDate = moment(maxDate).startOf('day');
    const dateToValidate = moment(date);

    if (dateToValidate < UNIX_EPOCH) {
      return 'Date is before the allowable range.';
    } else if (dateToValidate > newMaxDate) {
      return `End date must be later than Start date.`;
    } else if (dateToValidate > todaysDate) {
      return ' Start date must be earlier than End date.';
    } else {
      return '';
    }
  };

  const isValidDateRange = (start, end) => {
    const localStartDate = moment(start);
    const localEndDate = moment(end);
    if (!isValidISODateStr(start) || !isValidISODateStr(end)) {
      return false;
    }
    if (!localStartDate.isValid() || !localEndDate.isValid()) {
      return false;
    }
    if (localStartDate > localEndDate) {
      return false;
    }

    return true;
  };

  const setValidatedDateRange = (start, end) => {
    if (!isValidDateRange(start, end)) {
      return;
    }
    setDateRange({ start, end });
  };

  const onFromChange = (_event, value, _date) => {
    const selectedFromDate = moment(value).startOf('day');
    setStartDate(value);
    setValidatedDateRange(
      selectedFromDate.toISOString(),
      moment(endDate).toISOString(),
    );
  };

  const onToChange = (_event, value, _date) => {
    const selectedToDate = moment(value).endOf('day');
    setEndDate(value);
    setValidatedDateRange(
      moment(startDate).toISOString(),
      selectedToDate.toISOString(),
    );
  };

  return (
    <SplitItem>
      <Flex gap={{ default: 'gapSm' }}>
        <FlexItem>
          <DatePicker
            value={startDate}
            invalidFormatText="Invalid date YYYY-MM-DD"
            onChange={onFromChange}
            aria-label="Start date"
            validators={[fromValidator(endDate ?? '')]}
            placeholder="YYYY-MM-DD"
          />
        </FlexItem>
        <FlexItem>{'to'}</FlexItem>
        <FlexItem>
          <DatePicker
            value={endDate}
            invalidFormatText="Invalid date YYYY-MM-DD"
            onChange={onToChange}
            // TODO check this conditional
            rangeStart={startDate ? new Date(startDate) : new Date()}
            validators={[toValidator(startDate ?? '')]}
            aria-label="End date"
            placeholder="YYYY-MM-DD"
          />
        </FlexItem>
      </Flex>
    </SplitItem>
  );
};

DateRangeSelector.propTypes = {
  dateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
  }),
  setDateRange: PropTypes.func.isRequired,
};

export default DateRangeSelector;
