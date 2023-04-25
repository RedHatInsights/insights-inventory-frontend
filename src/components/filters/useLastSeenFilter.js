import { useState } from 'react';
import { LAST_SEEN_CHIP, lastSeenItems } from '../../Utilities/constants';
import moment from 'moment';
import { oldestDate } from './helpers.js';
export const lastSeenFilterState = { lastSeenFilter: [] };
export const LAST_SEEN_FILTER = 'LAST_SEEN_FILTER';
export const lastSeenFilterReducer = (_state, { type, payload }) => ({
    ...(type === LAST_SEEN_FILTER && {
        lastSeenFilter: payload
    })
});

export const useLastSeenFilter = (
    [state, dispatch] = [lastSeenFilterState]
) => {
    let [lastSeenStateValue, setLastSeenValue] = useState({});
    const lastSeenValue = dispatch ? state.lastSeenFilter : [lastSeenStateValue];
    const setValue = dispatch
        ? (newValue) => dispatch({ type: LAST_SEEN_FILTER, payload: newValue })
        : setLastSeenValue;

    const filter = {
        label: 'Last seen',
        value: 'last_seen',
        type: 'radio',
        filterValues: {
            value: lastSeenValue,
            onChange: (_e, value) => setValue(value),
            items: lastSeenItems
        }
    };

    const chip =
    !Array.isArray(lastSeenValue) && lastSeenValue !== undefined
        ? [
            {
                category: 'Last seen',
                type: LAST_SEEN_CHIP,
                chips: lastSeenItems
                .filter(({ value }) => value?.mark === lastSeenValue?.mark)
                .map(({ label, ...props }) => ({ name: label, ...props }))
            }
        ]
        : [];

    const [startDate, setStartDate] = useState(oldestDate);
    const [endDate, setEndDate] = useState();
    const todaysDate = moment();

    const manageStartDate = (apiStartDate, apiEndDate) => {
        const newApiStartDate = apiStartDate;
        const newApiEndDate = apiEndDate;
        if (isNaN(newApiEndDate) && isNaN(newApiStartDate)) {
            setValue({ ...lastSeenValue, updatedStart: null, updatedEnd: null });
        } else if (
            newApiStartDate > newApiEndDate ||
      isNaN(newApiStartDate) ||
      newApiStartDate > todaysDate
        ) {
            setValue({
                ...lastSeenValue,
                updatedStart: null,
                updatedEnd: `${newApiEndDate.format('YYYY-MM-DD')}T23:59:00.000Z`
            });
        } else {
            setValue({
                ...lastSeenValue,
                updatedStart: `${newApiStartDate.format('YYYY-MM-DD')}T00:00:00.000Z`
            });
        }
    };

    const manageEndDate = (apiStartDate, apiEndDate) => {
        const newApiStartDate = apiStartDate.startOf('day');
        const newApiEndDate = apiEndDate.endOf('day');

        if (isNaN(newApiEndDate) && isNaN(newApiStartDate)) {
            setValue({ ...lastSeenValue, updatedStart: null, updatedEnd: null });
        } else if (newApiStartDate > newApiEndDate || isNaN(newApiEndDate)) {
            setValue({
                ...lastSeenValue,
                updatedStart: `${newApiStartDate.format('YYYY-MM-DD')}T00:00:00.000Z`,
                updatedEnd: null
            });
        } else {
            setValue({ ...lastSeenValue, updatedEnd: `${newApiEndDate.format('YYYY-MM-DD')}T23:59:00.000Z` });
        }
    };

    //This date comes from patternfly component. This manages the 1st date picker
    const onFromChange = (date) => {
        const newToDate = moment(endDate).endOf('day');
        if (date > newToDate) {
            setStartDate();
            return 'End date must be later than Start date.';
        }

        setStartDate(date);
        const apiStartDate = moment(date).startOf('day');

        manageStartDate(apiStartDate, newToDate);
    };

    //This date comes from patternfly component. This manages the 2nd date picker
    const onToChange = (date) => {
        if (startDate > moment(date)) {
            return 'Start date must be earlier than End date.';
        } else if (moment(date) > todaysDate) {
            return 'End date must be later than Start date.';
        } else {
            setEndDate(date);
            const apiEndDate = moment(date).endOf('day');
            manageEndDate(moment(startDate), apiEndDate);
        }
    };

    return [
        filter,
        chip,
        lastSeenValue,
        setValue,
        onFromChange,
        onToChange,
        endDate,
        startDate,
        setStartDate,
        setEndDate
    ];
};
