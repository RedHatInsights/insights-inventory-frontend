/* eslint-disable react/prop-types */
import React, { Fragment, useEffect } from 'react';
import { useOperatingSystemFilter } from './useOperatingSystemFilter';
import { operatingSystems } from '../../Utilities/constants';
import { mount } from 'enzyme';

const HookRender = ({ hookAccessor, hookNotify }) => {
    const [filter, chip, value, setValue] = useOperatingSystemFilter();
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

describe('useOperatingSystemFilter', () => {
    it('should create filter', () => {
        const hookAccessor = ([filter]) => {
            expect(filter).toMatchObject({
                label: 'Operating System',
                value: 'operating-system',
                type: 'checkbox'
            });
            expect(filter.filterValues.value.length).toBe(0);
            expect(filter.filterValues.items).toMatchObject(operatingSystems);
        };

        mount(<HookRender hookAccessor={hookAccessor} />);
    });

    it('should create chip', () => {
        const hookAccessor = ([, , , setValue]) => {
            setValue(['8.4']);
        };

        const hookNotify = ([filter, chip, value]) => {
            expect(value).toMatchObject(['8.4']);
            expect(filter.filterValues.value.length).toBe(1);
            expect(chip).toMatchObject([{ category: 'Operating System', chips:
            [{ name: 'RHEL 8.4', value: '8.4' }], type: 'operating_system' }]);
        };

        mount(<HookRender hookAccessor={hookAccessor} hookNotify={hookNotify} />);
    });
});
