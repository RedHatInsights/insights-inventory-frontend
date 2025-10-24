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
  detailLoaded,
  handleClick,
  hasRelease,
  hasKernelRelease,
  hasArchitecture,
  hasLastBoot,
  hasKernelModules,
  entity,
  extra,
  systemProfile,
}) => {
  const systemInfo = operatingSystem(systemProfile, entity);
  return (
    <LoadingCard
      title="Operating system"
      cardId="os-card"
      isLoading={!detailLoaded}
      items={[
        ...(hasRelease
          ? [
              {
                title: 'Release',
                value: (
                  <OperatingSystemFormatter
                    operatingSystem={systemInfo.release}
                  />
                ),
              },
            ]
          : []),
        ...(hasKernelRelease
          ? [{ title: 'Kernel release', value: systemInfo.kernelRelease }]
          : []),
        ...(hasArchitecture
          ? [{ title: 'Architecture', value: systemInfo.architecture }]
          : []),
        ...(hasLastBoot
          ? [
              {
                title: 'Last boot time',
                value: isDate(systemInfo.bootTime) ? (
                  <DateFormat date={systemInfo.bootTime} type="onlyDate" />
                ) : (
                  'Not available'
                ),
              },
            ]
          : []),
        ...(hasKernelModules
          ? [
              {
                title: 'Kernel modules',
                value: systemInfo.kernelModules?.length,
                singular: 'module',
                target: 'kernel_modules',
                onClick: () => {
                  handleClick(
                    'Kernel modules',
                    generalMapper(systemInfo.kernelModules, 'Module'),
                  );
                },
              },
            ]
          : []),
        ...(systemInfo.systemUpdateMethod
          ? [{ title: 'Update method', value: systemInfo.systemUpdateMethod }]
          : []),
        ...extra.map(({ onClick, ...item }) => ({
          ...item,
          ...(onClick && { onClick: (e) => onClick(e, handleClick) }),
        })),
      ]}
    />
  );
};

OperatingSystemCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  handleClick: PropTypes.func,
  hasRelease: PropTypes.bool,
  hasKernelRelease: PropTypes.bool,
  hasArchitecture: PropTypes.bool,
  hasLastBoot: PropTypes.bool,
  hasKernelModules: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
  entity: PropTypes.shape({
    facts: PropTypes.object,
  }),
  systemProfile: PropTypes.shape({
    arch: PropTypes.string,
    operating_system: PropTypes.string,
    os_kernel_version: PropTypes.string,
    last_boot_time: PropTypes.string,
    kernel_modules: PropTypes.arrayOf(PropTypes.string),
    system_update_method: PropTypes.string,
  }),
};
OperatingSystemCardCore.defaultProps = {
  detailLoaded: false,
  handleClick: () => undefined,
  hasRelease: true,
  hasKernelRelease: true,
  hasArchitecture: true,
  hasLastBoot: true,
  hasKernelModules: true,
  extra: [],
};

export const OperatingSystemCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    detailLoaded: systemProfile && systemProfile.loaded,
    systemProfile,
  }),
)(OperatingSystemCardCore);

OperatingSystemCard.propTypes = OperatingSystemCardCore.propTypes;
OperatingSystemCard.defaultProps = OperatingSystemCardCore.defaultProps;

export default OperatingSystemCard;
