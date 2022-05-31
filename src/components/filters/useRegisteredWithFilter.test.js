/* eslint-disable react/prop-types */
import React, { Fragment, useEffect } from 'react';
import { useRegisteredWithFilter } from './useRegisteredWithFilter';
import { mount } from 'enzyme';

const HookRender = ({ hookAccessor, hookNotify }) => {
    const [filter, chip, registeredWithValue, setValue] = useRegisteredWithFilter();
    useEffect(() => {
        hookAccessor && hookAccessor([filter, chip, registeredWithValue, setValue]);
    }, []);
    useEffect(() => {
        if (registeredWithValue.length !== 0) {
            hookNotify && hookNotify([filter, chip, registeredWithValue, setValue]);
        }
    }, [registeredWithValue]);

    return <Fragment />;
};

describe('useRegisteredWithFilter', () => {
    it('should create filter', () => {
        const hookAccessor = ([filter]) => {
            expect(filter).toMatchObject({
                label: 'Data Collector',
                value: 'data-collector-registered-with',
                type: 'checkbox'
            });
            expect(filter.filterValues.value.length).toBe(0);
            expect(filter.filterValues.items).toMatchObject([
                { label: 'insights-client', value: 'puptoo' },
                { label: 'subscription-manager', value: 'rhsm-conduit' },
                { label: 'Satellite/Discovery', value: 'yupana' },
                { label: 'insights-client not connected', value: '!puptoo' }
            ]);
        };

        mount(<HookRender hookAccessor={hookAccessor} />);
    });

    it('should create chip', () => {
        const hookAccessor = ([, , , setValue]) => {
            setValue(['puptoo']);
        };

        const hookNotify = ([filter, chip, registeredWithValue]) => {
            expect(registeredWithValue).toMatchObject(['puptoo']);
            expect(filter.filterValues.value.length).toBe(1);
            expect(chip).toMatchObject([{
                category: 'Data Collector',
                chips: [{ name: 'insights-client', value: 'puptoo' }],
                type: 'registered_with'
            }]);
        };

        mount(<HookRender hookAccessor={hookAccessor} hookNotify={hookNotify} />);
    });
});
