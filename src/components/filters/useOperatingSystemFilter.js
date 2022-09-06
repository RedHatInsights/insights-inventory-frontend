import { useState } from 'react';
import { buildOSFilterConfig, buildOSChip, toGroupSelectionValue } from '../../Utilities/OperatingSystemFilterHelpers';

export const operatingSystemFilterState = { operatingSystemFilter: [] };
export const OPERATING_SYSTEM_FILTER = 'OPERATING_SYSTEM_FILTER';
export const operatingSystemFilterReducer = (_state, { type, payload }) => ({
    ...type === OPERATING_SYSTEM_FILTER && {
        operatingSystemFilter: payload
    }
});

export const useOperatingSystemFilter = (
    operatingSystems,
    areOperatingSystemsLoaded,
    [state, dispatch] = [operatingSystemFilterState]
) => {
    // FIXME: is this state value needed and used at all?
    const [operatingSystemStateValue, setStateValue] = useState([]);
    const operatingSystemValue = dispatch ? state.operatingSystemFilter : operatingSystemStateValue;
    const setValue = dispatch
        ? (newValue) =>
            dispatch({
                type: OPERATING_SYSTEM_FILTER,
                payload: Array.isArray(newValue)
                    ? toGroupSelectionValue(newValue)
                    : newValue
            })
        : setStateValue;
    const filter = buildOSFilterConfig({
        value: operatingSystemValue,
        onChange: (_e, value) => setValue(value)
        // TODO: better handling (spinner, skeleton) of loading systems?
    }, areOperatingSystemsLoaded ? operatingSystems : []);
    const chip = buildOSChip(operatingSystemValue,  areOperatingSystemsLoaded ? operatingSystems : []);

    return [filter, chip, operatingSystemValue, setValue];
};
