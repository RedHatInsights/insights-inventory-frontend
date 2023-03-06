import { useState } from 'react';
import { LAST_SEEN_CHIP, lastSeenItems } from '../../Utilities/constants';

export const lastSeenFilterState = { lastSeenFilter: [] };
export const LAST_SEEN_FILTER = 'LAST_SEEN_FILTER';
export const lastSeenFilterReducer = (_state, { type, payload }) => ({
    ...type === LAST_SEEN_FILTER && {
        lastSeenFilter: payload
    }
});

export const useLastSeenFilter = ([state, dispatch] = [lastSeenFilterState]) => {
    let [lastSeenStateValue, setLastSeenValue] = useState({});
    const lastSeenValue = dispatch ? state.lastSeenFilter : [lastSeenStateValue];
    const setValue = dispatch ? (newValue) => dispatch({ type: LAST_SEEN_FILTER, payload: newValue }) : setLastSeenValue;

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

    const chip = (!Array.isArray(lastSeenValue) && lastSeenValue !== undefined)  ? [{
        category: 'Last seen',
        type: LAST_SEEN_CHIP,
        chips: lastSeenItems.filter(({ value }) => value?.mark === lastSeenValue?.mark)
        .map(({ label, ...props }) => ({ name: label, ...props }))
    }] : [];

    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const toValidator = date => date >= startDate ? '' : 'To date must be less than from date';

    const onFromChange = (_str, date) => {
        setStartDate((date));
        setValue({ ...lastSeenValue, updatedStart: new Date(date).toISOString() });
        date.setDate(date.getDate() + 1);
    };

    const onToChange = (date) => {
        setEndDate(date);
        setValue({ ...lastSeenValue, updatedEnd: new Date(date).toISOString() });
    };

    return [filter, chip, lastSeenValue, setValue, toValidator, onFromChange, onToChange, endDate, startDate];
};
