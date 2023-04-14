import { useState } from 'react';
import { LAST_SEEN_CHIP, lastSeenItems } from '../../Utilities/constants';

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

    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const todaysDate = new Date();

    const manageStartDate = (apiStartDate, apiEndDate)=> {
        if (isNaN(apiEndDate) &&  isNaN(apiStartDate)) {
            setValue({ ...lastSeenValue, updatedStart: null, updatedEnd: null });
        } else if (apiStartDate > apiEndDate || isNaN(apiStartDate) || apiStartDate > todaysDate) {
            setValue({ ...lastSeenValue, updatedStart: null, updatedEnd: apiEndDate.toISOString() });
        } else {
            setValue({ ...lastSeenValue, updatedStart: apiStartDate.toISOString() });
        }
    };

    const manageEndDate = (apiStartDate, apiEndDate)=> {
        if (isNaN(apiEndDate) &&  isNaN(apiStartDate)) {
            setValue({ ...lastSeenValue, updatedStart: null, updatedEnd: null });
        } else if (apiStartDate > apiEndDate || isNaN(apiEndDate)) {
            setValue({ ...lastSeenValue, updatedStart: apiStartDate.toISOString(), updatedEnd: null });
        } else {
            setValue({ ...lastSeenValue, updatedEnd: apiEndDate.toISOString() });
        }
    };

    const toValidator = (date) => {
        const newDate = new Date(date);
        const minDate = new Date(startDate);

        if (minDate >= newDate) {
            return 'Start date must be earlier than End date.';
        } else if (newDate > todaysDate) {
            return `Date must be ${todaysDate.toISOString().split('T')[0]} or earlier`;
        } else {
            return '';
        }
    };

    const fromValidator = (date) => {
        const minDate = new Date(1950, 1, 1);
        const maxDate = new Date(endDate);

        if (date < minDate) {
            return 'Date is before the allowable range.';
        } else if (date > maxDate) {
            return `End date must be later than Start date.`;
        } else if (date > todaysDate) {
            return ' Start date must be earlier than End date.';
        } else {
            return '';
        }
    };

    const onFromChange = (date) => {
        const newToDate = new Date(endDate);
        if (date > newToDate) {
            setStartDate();
            return 'End date must be later than Start date.';
        }

        setStartDate(date);
        const apiStartDate = new Date(date);
        apiStartDate.setUTCHours(0);
        manageStartDate(apiStartDate, newToDate);
    };

    const onToChange = (date) => {
        if (startDate > new Date(date)) {
            return 'Start date must be earlier than End date.';
        } else if (new Date(date) > todaysDate) {
            return 'End date must be later than Start date.';
        } else {
            setEndDate(date);
            const apiEndDate = new Date(date);
            apiEndDate.setUTCHours(23, 59);
            manageEndDate(new Date(startDate), apiEndDate);
        }
    };

    return [
        filter,
        chip,
        lastSeenValue,
        setValue,
        toValidator,
        onFromChange,
        onToChange,
        endDate,
        startDate,
        fromValidator,
        setStartDate,
        setEndDate
    ];
};
