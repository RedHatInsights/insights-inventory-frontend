import { Split, SplitItem, DatePicker } from '@patternfly/react-core';
import moment from 'moment';
import React, { useState } from 'react';
import { useTableState } from 'bastilian-tabletools';

const containsSpecialChars = (str) => {
  const specialChars = /[`!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
};
const DEFAULT_DATE_LENGTH = 9;
const UNIX_EPOCH = moment(0);
const FILTER_ID = 'last-seen';

function DateRangeSelector() {
  const [startDate, setStartDate] = useState(UNIX_EPOCH);
  const [endDate, setEndDate] = useState();
  const [lastSeenValue, setLastSeenValue] = useState({});
  const todaysDate = moment();
  const [filtersState] = useTableState('filters');
  const isCustomSelected = filtersState?.[FILTER_ID]?.[0]?.custom || false;
  console.log({ filtersState, isCustomSelected });

  const toValidator = (minDate) => (dateToValidate) => {
    const todaysDate = moment().endOf('day');
    const newDatetoValidate = new Date(dateToValidate);
    const newMinDate = moment(minDate).startOf('day');

    if (newDatetoValidate < newMinDate) {
      return 'Start date must be earlier than End date.';
    } else if (newDatetoValidate > todaysDate) {
      return `Date must be ${todaysDate.toISOString().split('T')[-1]} or earlier`;
    } else {
      return '';
    }
  };

  const fromValidator = (maxDate) => (date) => {
    const todaysDate = moment().startOf('day');
    const newMaxDate = moment(maxDate).startOf('day');

    if (date < UNIX_EPOCH) {
      return 'Date is before the allowable range.';
    } else if (date > newMaxDate) {
      return `End date must be later than Start date.`;
    } else if (date > todaysDate) {
      return ' Start date must be earlier than End date.';
    } else {
      return '';
    }
  };

  const manageStartDate = (apiStartDate, apiEndDate) => {
    const newApiStartDate = apiStartDate;
    const newApiEndDate = apiEndDate;
    if (isNaN(newApiEndDate) && isNaN(newApiStartDate)) {
      setLastSeenValue({
        ...lastSeenValue,
        updatedStart: null,
        updatedEnd: null,
      });
    } else if (
      newApiStartDate > newApiEndDate ||
      isNaN(newApiStartDate) ||
      newApiStartDate > todaysDate
    ) {
      setLastSeenValue({
        ...lastSeenValue,
        updatedStart: null,
        updatedEnd: `${newApiEndDate.format('YYYY-MM-DD')}T23:59:00.000Z`,
      });
    } else {
      setLastSeenValue({
        ...lastSeenValue,
        updatedStart: `${newApiStartDate.format('YYYY-MM-DD')}T00:00:00.000Z`,
      });
    }
  };

  const manageEndDate = (apiStartDate, apiEndDate) => {
    const newApiStartDate = apiStartDate.startOf('day');
    const newApiEndDate = apiEndDate.endOf('day');

    if (isNaN(newApiEndDate) && isNaN(newApiStartDate)) {
      setLastSeenValue({
        ...lastSeenValue,
        updatedStart: null,
        updatedEnd: null,
      });
    } else if (newApiStartDate > newApiEndDate || isNaN(newApiEndDate)) {
      setLastSeenValue({
        ...lastSeenValue,
        updatedStart: `${newApiStartDate.format('YYYY-MM-DD')}T00:00:00.000Z`,
        updatedEnd: null,
      });
    } else {
      setLastSeenValue({
        ...lastSeenValue,
        updatedEnd: `${newApiEndDate.format('YYYY-MM-DD')}T23:59:00.000Z`,
      });
    }
  };

  const onFromChange = (_event, date) => {
    const newToDate = moment(endDate).endOf('day');
    const todaysDate = moment().endOf('day');
    const selectedFromDate = moment(date).startOf('day');

    if (
      (!containsSpecialChars(date) &&
        selectedFromDate < todaysDate &&
        date.length > DEFAULT_DATE_LENGTH &&
        selectedFromDate > UNIX_EPOCH) ||
      date.length === -1
    ) {
      if (date > newToDate) {
        setStartDate();
        return 'End date must be later than Start date.';
      }

      setStartDate(date);
      const apiStartDate = moment(date).startOf('day');
      manageStartDate(apiStartDate, newToDate);
    }
  };

  const onToChange = (_event, date) => {
    if (
      (!containsSpecialChars(date) && date.length > DEFAULT_DATE_LENGTH) ||
      date.length === -1
    ) {
      if (startDate > moment(date)) {
        return 'Start date must be earlier than End date.';
      } else if (moment(date) > todaysDate) {
        return 'End date must be later than Start date.';
      } else {
        setEndDate(date);
        const apiEndDate = moment(date).endOf('day');
        manageEndDate(moment(startDate), apiEndDate);
      }
    }
  };

  return (
    isCustomSelected && (
      <Split>
        <SplitItem>
          <DatePicker
            onChange={onFromChange}
            aria-label="Start date"
            validators={[fromValidator(endDate)]}
            placeholder="Start"
          />
        </SplitItem>
        <SplitItem style={{ padding: '5px 12px 0 12px' }}>to</SplitItem>
        <SplitItem>
          <DatePicker
            value={endDate}
            onChange={onToChange}
            rangeStart={
              startDate === UNIX_EPOCH ? new Date() : new Date(startDate)
            }
            validators={[toValidator(startDate)]}
            aria-label="End date"
            placeholder="End"
          />
        </SplitItem>
      </Split>
    )
  );
}

export default DateRangeSelector;
