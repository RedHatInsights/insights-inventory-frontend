import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { generalMapper } from '../dataMapper';
import { operatingSystem } from '../selectors';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { extraShape, isDate } from '../../../constants';
import OperatingSystemFormatter from '../../../Utilities/OperatingSystemFormatter';

const OperatingSystemCardCore = ({
    systemInfo,
    detailLoaded,
    handleClick,
    hasRelease,
    hasKernelRelease,
    hasArchitecture,
    hasLastBoot,
    hasKernelModules,
    extra
}) => (
    <LoadingCard
        title="Operating system"
        isLoading={ !detailLoaded }
        items={ [
            ...hasRelease ? [{ title: 'Release', value: <OperatingSystemFormatter operatingSystem={systemInfo.release} /> }] : [],
            ...hasKernelRelease ? [{ title: 'Kernel release', value: systemInfo.kernelRelease }] : [],
            ...hasArchitecture ? [{ title: 'Architecture', value: systemInfo.architecture }] : [],
            ...hasLastBoot ? [{ title: 'Last boot time', value: (isDate(systemInfo.bootTime) ?
                <DateFormat date={ systemInfo.bootTime } type="onlyDate" /> :
                'Not available'
            )
            }] : [],
            ...hasKernelModules ? [{
                title: 'Kernel modules',
                value: systemInfo.kernelModules?.length,
                singular: 'module',
                target: 'kernel_modules',
                onClick: () => {
                    handleClick(
                        'Kernel modules',
                        generalMapper(systemInfo.kernelModules, 'Module')
                    );
                }
            }] : [],
            ...extra.map(({ onClick, ...item }) => ({
                ...item,
                ...onClick && { onClick: (e) => onClick(e, handleClick) }
            }))
        ] }
    />
);

OperatingSystemCardCore.propTypes = {
    detailLoaded: PropTypes.bool,
    handleClick: PropTypes.func,
    systemInfo: PropTypes.shape({
        release: PropTypes.shape({
            name: PropTypes.string,
            major: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            minor: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        }),
        architecture: PropTypes.string,
        kernelRelease: PropTypes.string,
        bootTime: PropTypes.string,
        kernelModules: PropTypes.arrayOf(PropTypes.string)
    }),
    hasRelease: PropTypes.bool,
    hasKernelRelease: PropTypes.bool,
    hasArchitecture: PropTypes.bool,
    hasLastBoot: PropTypes.bool,
    hasKernelModules: PropTypes.bool,
    extra: PropTypes.arrayOf(extraShape)
};
OperatingSystemCardCore.defaultProps = {
    detailLoaded: false,
    handleClick: () => undefined,
    hasRelease: true,
    hasKernelRelease: true,
    hasArchitecture: true,
    hasLastBoot: true,
    hasKernelModules: true,
    extra: []
};

export const OperatingSystemCard = connect(({
    entityDetails: {
        entity
    },
    systemProfileStore: {
        systemProfile
    }
}) => ({
    detailLoaded: systemProfile && systemProfile.loaded,
    systemInfo: operatingSystem(systemProfile, entity)
}))(OperatingSystemCardCore);

OperatingSystemCard.propTypes = OperatingSystemCardCore.propTypes;
OperatingSystemCard.defaultProps = OperatingSystemCardCore.defaultProps;

export default OperatingSystemCard;
