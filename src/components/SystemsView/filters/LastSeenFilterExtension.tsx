import React, { FC } from 'react';
import DateRangePicker from '../../../routes/Systems/components/SystemsTable/components/DateRangePicker';
import moment from 'moment';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';

export const LastSeenFilterExtension: FC = () => {
  const { filters, lastSeenCustomRange, setLastSeenCustomRange } =
    useDataViewFiltersContext();

  const isCustomSelected = filters.last_seen === 'custom';

  const [selectedStartDate] = lastSeenCustomRange?.start?.split('T') || [];
  const [selectedEndDate] = lastSeenCustomRange?.end?.split('T') || [];
  const selectedDateRange = { start: selectedStartDate, end: selectedEndDate };

  return (
    isCustomSelected && (
      <DateRangePicker
        dateRange={selectedDateRange}
        onDateRangeChange={(next) => {
          setLastSeenCustomRange({
            start: next?.start
              ? moment(next.start).startOf('day').toISOString()
              : undefined,
            end: next?.end
              ? moment(next.end).endOf('day').toISOString()
              : undefined,
          });
        }}
      />
    )
  );
};

export default LastSeenFilterExtension;
