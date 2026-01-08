import React, { FC } from 'react';
import DateRangePicker from '../../../routes/Systems/components/SystemsTable/components/DateRangePicker';
import moment from 'moment';
import { LastSeenFilterProps } from './LastSeenFilter';

type LastSeenFilterExtensionProps = LastSeenFilterProps;

export const LastSeenFilterExtension: FC<LastSeenFilterExtensionProps> = ({
  value,
  onChange,
}) => {
  const CUSTOM_LABEL = 'Custom';

  const [selectedStartDate] = value?.start?.split('T') || [];
  const [selectedEndDate] = value?.end?.split('T') || [];
  const selectedDateRange = { start: selectedStartDate, end: selectedEndDate };
  const isCustomSelected = value?.label === CUSTOM_LABEL;

  return (
    isCustomSelected && (
      <DateRangePicker
        dateRange={selectedDateRange}
        onDateRangeChange={(next) => {
          onChange?.(undefined, {
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

export default LastSeenFilterExtension;
