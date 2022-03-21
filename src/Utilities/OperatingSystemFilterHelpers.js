import { OS_CHIP, operatingSystems } from './index';

export const toGroupSelectionValue = (osVersions) => osVersions.reduce((acc, version) => {
    const [majorVersion, minorVersion] = version.split('.');
    acc[`${majorVersion}.0`] = {
        ...(acc[`${majorVersion}.0`] || {}),
        [`${majorVersion}.${minorVersion}`]: true
    };
    return acc;
}, {});

export const groupOSVersions = (osVersions) => {
    const majorVersions = osVersions.filter(({ value }) => value.split('.')[1] === '0');

    return majorVersions.map((majorVersion) => ({
        ...majorVersion,
        groupSelectable: true,
        items: osVersions.filter(({ value }) => {
            const [majorOsVersion, minorOsVersion] = value.split('.');
            return majorOsVersion === majorVersion.value.split('.')[0] && minorOsVersion !== '0';
        }).sort(({ value }) => value.split('.')[1])
    }));
};

export const buildOSFilterConfig = (config = {}) => ({
    ...config,
    label: 'Operating System',
    type: 'group',
    filterValues: {
        selected: config.value,
        onChange: config.onChange,
        groups: groupOSVersions(operatingSystems).map((item) => ({
            ...item,
            type: 'checkbox',
            items: item.items?.map((subItem) => ({
                ...subItem,
                type: 'checkbox'
            }))
        }))
    }
});

export const buildOSChip = (operatingSystemValue) => {
    const value = Object.values(operatingSystemValue || {}).flatMap((majorOsVersion) => Object.keys(majorOsVersion));
    return (value?.length > 0 ? [{
        category: 'Operating System',
        type: OS_CHIP,
        chips: operatingSystems.filter(({ value: osValue }) => value.some((osFilterValue) => osFilterValue === osValue))
        .map(({ label, ...props }) => ({ name: label, ...props }))
    }] : []);};
