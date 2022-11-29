import { useState } from 'react';
import { UPDATE_METHOD_KEY, updateMethodOptions } from '../../Utilities/index';

export const updateMethodFilterState = { updateMethodFilter: null };
export const UPDATE_METHOD_FILTER = 'UPDATE_METHOD_FILTER';
export const updateMethodFilterReducer = (_state, { type, payload }) => ({
    ...type === UPDATE_METHOD_FILTER && {
        updateMethodFilter: payload
    }
});

export const useUpdateMethodFilter = ([state, dispatch] = [updateMethodFilterState]) => {
    let [filterStateValue, setStateValue] = useState([]);
    const updateMethodValue = dispatch ? state.updateMethodFilter : filterStateValue;
    const setValue = dispatch ? (newValue) => dispatch({ type: UPDATE_METHOD_FILTER, payload: newValue }) : setStateValue;

    const filter = {
        label: 'System Update Method',
        value: 'update-method',
        type: 'checkbox',
        filterValues: {
            value: updateMethodValue,
            onChange: (_e, value) => setValue(value),
            items: updateMethodOptions
        }
    };
    const chip = updateMethodValue?.length > 0 ? [{
        category: 'System Update Method',
        type: UPDATE_METHOD_KEY,
        chips: updateMethodOptions.filter(({ value }) => updateMethodValue.includes(value))
        .map(({ label, ...props }) => ({ name: label, ...props }))
    }] : [];
    return [filter, chip, updateMethodValue, setValue];
};
