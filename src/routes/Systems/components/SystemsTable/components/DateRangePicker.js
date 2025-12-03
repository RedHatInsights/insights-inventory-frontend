import React, { useState, useCallback } from 'react';
import { DatePicker, Split, SplitItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import {
  startDateValidator,
  endDateValidator,
  isValidDateRange,
} from './helpers';
import { isValidISODateStr } from './helpers';

export const DateRangePicker = ({ dateRange, onDateRangeChange }) => {
  const [startDate, setStartDate] = useState(dateRange?.start);
  const [endDate, setEndDate] = useState(dateRange?.end);

  const updateValidatedDateRange = useCallback(
    (start, end) => {
      if (start && !isValidISODateStr(start)) {
        return;
      }
      if (end && !isValidISODateStr(end)) {
        return;
      }

      let next = {};
      if (!start && end) {
        next = {
          start: undefined,
          end,
        };
      } else if (start && !end) {
        next = {
          start,
          end: undefined,
        };
      } else if (isValidDateRange(start, end)) {
        next = {
          start,
          end,
        };
      }
      onDateRangeChange(next);
    },
    [onDateRangeChange],
  );

  const onStartDateChange = useCallback(
    (_event, value) => {
      setStartDate(value);
      updateValidatedDateRange(value, endDate);
    },
    [endDate, updateValidatedDateRange],
  );

  const onEndDateChange = useCallback(
    (_event, value) => {
      setEndDate(value);
      updateValidatedDateRange(startDate, value);
    },
    [startDate, updateValidatedDateRange],
  );

  return (
    <SplitItem>
      <Split>
        <SplitItem>
          <DatePicker
            value={startDate}
            invalidFormatText="Invalid date YYYY-MM-DD"
            onChange={onStartDateChange}
            aria-label="Start date"
            validators={[startDateValidator(endDate ?? '')]}
            placeholder="Start"
          />
        </SplitItem>
        <SplitItem style={{ padding: '6px 12px 0 12px' }}>{'to'}</SplitItem>
        <SplitItem>
          <DatePicker
            value={endDate}
            invalidFormatText="Invalid date YYYY-MM-DD"
            onChange={onEndDateChange}
            rangeStart={startDate ? new Date(startDate) : new Date()}
            validators={[endDateValidator(startDate ?? '')]}
            aria-label="End date"
            placeholder="End"
          />
        </SplitItem>
      </Split>
    </SplitItem>
  );
};

DateRangePicker.propTypes = {
  dateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
  }),
  onDateRangeChange: PropTypes.func.isRequired,
};

export default DateRangePicker;
