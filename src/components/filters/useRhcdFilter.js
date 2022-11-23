import { useState } from 'react';
import { RHCD_FILTER_KEY, rhcdOptions } from '../../Utilities/index';

export const rhcdFilterState = { rhcdFilter: null };
export const RHCD_FILTER = 'RHCD_FILTER';
export const rhcdFilterReducer = (_state, { type, payload }) => ({
    ...type === RHCD_FILTER && {
        rhcdFilter: payload
    }
});

export const useRhcdFilter = ([state, dispatch] = [rhcdFilterState]) => {
    let [rhcdStateValue, setStateValue] = useState([]);
    const rhcdValue = dispatch ? state.rhcdFilter : rhcdStateValue;
    const setValue = dispatch ? (newValue) => dispatch({ type: RHCD_FILTER, payload: newValue }) : setStateValue;

    const filter = {
        label: 'RHC status',
        value: 'rhc-status',
        type: 'checkbox',
        filterValues: {
            value: rhcdValue,
            onChange: (_e, value) => setValue(value),
            items: rhcdOptions
        }
    };
    const chip = rhcdValue?.length > 0 ? [{
        category: 'RHC status',
        type: RHCD_FILTER_KEY,
        chips: rhcdOptions.filter(({ value }) => rhcdValue.includes(value))
        .map(({ label, ...props }) => ({ name: label, ...props }))
    }] : [];
    return [filter, chip, rhcdValue, setValue];
};
