/* eslint-disable react/prop-types */
import React, { Fragment, useEffect } from 'react';
import { useUpdateMethodFilter } from './useUpdateMethodFilter';
import { updateMethodOptions, UPDATE_METHOD_KEY } from '../../Utilities';
import { mount } from 'enzyme';

const HookRender = ({ hookAccessor, hookNotify }) => {
    const [filter, chip, value, setValue] = useUpdateMethodFilter();
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

describe('useUpdateMethodFilter', () => {
    it('should create filter', () => {
        const hookAccessor = ([filter]) => {
            expect(filter).toMatchObject({
                label: 'System Update Method',
                value: 'update-method',
                type: 'checkbox'
            });
            expect(filter.filterValues.value.length).toBe(0);
            expect(filter.filterValues.items).toMatchObject(updateMethodOptions);
        };

        mount(<HookRender hookAccessor={hookAccessor} />);
    });

    it('should create chip', () => {
        const hookAccessor = ([, , , setValue]) => {
            setValue(['yum']);
        };

        const hookNotify = ([filter, chip, value]) => {
            expect(value).toMatchObject(['yum']);
            expect(filter.filterValues.value.length).toBe(1);
            expect(chip).toMatchObject(
                [{
                    category: 'System Update Method',
                    chips: [{ name: 'yum', value: 'yum' }],
                    type: UPDATE_METHOD_KEY
                }]
            );
        };

        mount(<HookRender hookAccessor={hookAccessor} hookNotify={hookNotify} />);
    });
});
