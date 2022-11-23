/* eslint-disable react/prop-types */
import React, { Fragment, useEffect } from 'react';
import { useRhcdFilter } from './useRhcdFilter';
import { rhcdOptions } from '../../Utilities';
import { mount } from 'enzyme';

const HookRender = ({ hookAccessor, hookNotify }) => {
    const [filter, chip, value, setValue] = useRhcdFilter();
    useEffect(() => {
        hookAccessor && hookAccessor([filter, chip, value, setValue]);
    }, []);
    useEffect(() => {
        if (value.length !== 0) {
            hookNotify && hookNotify([filter, chip, value, setValue]);
        }
    }, [value]);

    return <Fragment />;
};

describe('useRhcdFilter', () => {
    it('should create filter', () => {
        const hookAccessor = ([filter]) => {
            expect(filter).toMatchObject({
                label: 'RHC status',
                value: 'rhc-status',
                type: 'checkbox'
            });
            expect(filter.filterValues.value.length).toBe(0);
            expect(filter.filterValues.items).toMatchObject(rhcdOptions);
        };

        mount(<HookRender hookAccessor={hookAccessor} />);
    });

    it('should create chip', () => {
        const hookAccessor = ([, , , setValue]) => {
            setValue(['not_nil']);
        };

        const hookNotify = ([filter, chip, value]) => {
            expect(value).toMatchObject(['not_nil']);
            expect(filter.filterValues.value.length).toBe(1);
            expect(chip).toMatchObject(
                [{
                    category: 'RHC status',
                    chips: [{ name: 'Active', value: 'not_nil' }],
                    type: 'rhc_client_id'
                }]
            );
        };

        mount(<HookRender hookAccessor={hookAccessor} hookNotify={hookNotify} />);
    });
});
