import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { generalMapper } from '../dataMapper';
import { propertiesSelector, infrastructureSelector } from '../selectors';
import { extraShape } from '../../../constants';

const HardwarePropertiesCardCore = ({
  handleClick = () => undefined,
  detailLoaded = false,
  hasCPUs = true,
  hasSockets = true,
  hasCores = true,
  hasCPUFlags = true,
  hasRAM = true,
  hasType = true,
  hasVendor = true,
  extra = [],
  properties = {},
  infrastructure = {},
  entity,
}) => {
  const type =
    infrastructure.infrastructure_type ||
    (entity?.facts?.rhsm?.IS_VIRTUAL !== undefined &&
      (entity?.facts?.rhsm?.IS_VIRTUAL ? 'virtual' : 'physical')) ||
    undefined;

  return (
    <LoadingCard
      title="Hardware properties"
      isLoading={!detailLoaded}
      cardId="hardware-properties-card"
      items={[
        ...(hasCPUs
          ? [{ title: 'Number of CPUs', value: properties.cpuNumber }]
          : []),
        ...(hasRAM ? [{ title: 'RAM', value: properties.ramSize }] : []),
        ...(hasSockets
          ? [{ title: 'Sockets', value: properties.sockets }]
          : []),
        ...(hasType ? [{ title: 'Type', value: type }] : []),
        ...(hasCores
          ? [
              {
                title: 'Cores per socket',
                value: properties.coresPerSocket,
              },
            ]
          : []),
        ...(hasVendor
          ? [{ title: 'Vendor', value: infrastructure.vendor }]
          : []),
        ...(hasCPUFlags
          ? [
              {
                title: 'CPU flags',
                value: properties?.cpuFlags?.length,
                singular: 'flag',
                target: 'flag',
                onClick: () =>
                  handleClick(
                    'CPU flags',
                    generalMapper(properties.cpuFlags, 'Flag name'),
                  ),
              },
            ]
          : []),
        ...extra.map(({ onClick, ...item }) => ({
          ...item,
          ...(onClick && { onClick: (e) => onClick(e, handleClick) }),
        })),
      ]}
    />
  );
};

HardwarePropertiesCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  handleClick: PropTypes.func,
  hasCPUs: PropTypes.bool,
  hasSockets: PropTypes.bool,
  hasCores: PropTypes.bool,
  hasCPUFlags: PropTypes.bool,
  hasRAM: PropTypes.bool,
  hasType: PropTypes.bool,
  hasVendor: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
  entity: PropTypes.object,
  properties: PropTypes.shape({
    cpuNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sockets: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    coresPerSocket: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cpuFlags: PropTypes.array,
    ramSize: PropTypes.string,
  }),
  infrastructure: PropTypes.shape({
    infrastructure_type: PropTypes.string,
    vendor: PropTypes.string,
  }),
};

const mapStateToProps = (
  { systemProfileStore: { systemProfile } },
  { entity },
) => ({
  detailLoaded: systemProfile && systemProfile.loaded,
  properties: propertiesSelector(systemProfile, entity),
  infrastructure: infrastructureSelector(systemProfile),
});

export const HardwarePropertiesCard = connect(mapStateToProps)(
  HardwarePropertiesCardCore,
);

HardwarePropertiesCard.propTypes = {
  ...HardwarePropertiesCardCore.propTypes,
  entity: PropTypes.object,
};

export default HardwarePropertiesCard;
