import { useState } from 'react';
import { buildOSFilterConfig, buildOSChip } from '../../Utilities/OperatingSystemFilterHelpers';

export const operatingSystemFilterState = { operatingSystemFilter: [] };
export const OPERATING_SYSTEM_FILTER = 'OPERATING_SYSTEM_FILTER';
export const operatingSystemFilterReducer = (_state, { type, payload }) => ({
    ...type === OPERATING_SYSTEM_FILTER && {
        operatingSystemFilter: payload
    }
});

export const useOperatingSystemFilter = ([state, dispatch] = [operatingSystemFilterState]) => {
    const [operatingSystemStateValue, setStateValue] = useState([]);
    const operatingSystemValue = dispatch ? state.operatingSystemFilter : operatingSystemStateValue;
    const setValue = dispatch ? (newValue) => dispatch({ type: OPERATING_SYSTEM_FILTER, payload: newValue }) : setStateValue;
    const filter = buildOSFilterConfig({
        value: operatingSystemValue,
        onChange: (_e, value) => setValue(value)
    });
    const chip = buildOSChip(operatingSystemValue);

    return [filter, chip, operatingSystemValue, setValue];
};
