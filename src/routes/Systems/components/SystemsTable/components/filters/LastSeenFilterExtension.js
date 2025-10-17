import React, { useCallback } from 'react';
import DateRangePicker from '../DateRangePicker';
import { CUSTOM_LABEL } from '../helpers';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useFullTableState } from 'bastilian-tabletools';

const LastSeenFilterExtension = () => {
  // hook into tableTools
  const tableState = useFullTableState();
  const onChange = useCallback(
    (value) => {
      tableState?.callbacks?.setFilter?.('last-seen', value);
    },
    [tableState],
  );
  const value = tableState?.tableState?.filters?.['last-seen'];

  const [selectedStartDate] = value?.start?.split('T') || [];
  const [selectedEndDate] = value?.end?.split('T') || [];
  const selectedLabel = value?.label;
  const selectedDateRange = { start: selectedStartDate, end: selectedEndDate };
  const isCustomSelected = selectedLabel === CUSTOM_LABEL;

  return (
    isCustomSelected && (
      <DateRangePicker
        dateRange={selectedDateRange}
        onDateRangeChange={(next) => {
          onChange({
            ...selectedDateRange,
            ...{
              start: next?.start
                ? moment(next.start).startOf('day').toISOString()
                : undefined,
              end: next?.end
                ? moment(next.end).endOf('day').toISOString()
                : undefined,
              label: CUSTOM_LABEL,
            },
          });
        }}
      />
    )
  );
};

LastSeenFilterExtension.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
        label: PropTypes.string,
      }),
      PropTypes.bool,
    ]),
  ),
  onChange: PropTypes.func.isRequired,
};

export default LastSeenFilterExtension;
