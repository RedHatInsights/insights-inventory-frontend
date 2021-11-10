import { useState } from 'react';
import { OS_CHIP, operatingSystems } from '../../Utilities/index';

export const operatingSystemFilterState = { operatingSystemFilter: [] };
export const OPERATING_SYSTEM_FILTER = 'OPERATING_SYSTEM_FILTER';
export const operatingSystemFilterReducer = (_state, { type, payload }) => ({
    ...type === OPERATING_SYSTEM_FILTER && {
        operatingSystemFilter: {
            system_profile: {
                operating_system: {
                    RHEL: {
                        version: payload
                    }
                }
            }
        }
    }
});

export const useOperatingSystemFilter = ([state, dispatch] = [operatingSystemFilterState]) => {
    let [operatingSystemStateValue, setStateValue] = useState([]);
    const operatingSystemValue = dispatch ? state.operatingSystemFilter : operatingSystemStateValue;
    const setValue = dispatch ? (newValue) => dispatch({ type: OPERATING_SYSTEM_FILTER, payload: newValue }) : setStateValue;

    const filter = {
        label: 'Operating System',
        value: 'operating-system',
        type: 'checkbox',
        filterValues: {
            value: operatingSystemValue,
            onChange: (_e, value) => setValue(value),
            items: operatingSystems
        }
    };
    const chip = operatingSystemValue?.length > 0 ? [{
        category: 'Operating System',
        type: OS_CHIP,
        chips: operatingSystems.filter(({ value }) => operatingSystemValue.includes(value))
        .map(({ label, ...props }) => ({ name: label, ...props }))
    }] : [];
    return [filter, chip, operatingSystemValue, setValue];
};
