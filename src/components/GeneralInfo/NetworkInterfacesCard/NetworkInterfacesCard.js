import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { generalMapper, interfaceMapper } from '../dataMapper';
import { infrastructureSelector } from '../selectors';
import { extraShape } from '../../../constants';

const NetworkInterfacesCardCore = ({
  infrastructure,
  handleClick = () => undefined,
  detailLoaded = false,
  hasIPv4 = true,
  hasIPv6 = true,
  hasFqdn = true,
  hasInterfaces = true,
  extra = [],
}) => (
  <LoadingCard
    title="Network interfaces"
    isLoading={!detailLoaded}
    cardId="network-interfaces-card"
    items={[
      ...(hasIPv4
        ? [
            {
              title: 'IPv4 addresses',
              value: infrastructure.ipv4?.length,
              plural: 'addresses',
              singular: 'address',
              target: 'ipv4',
              onClick: () => {
                handleClick(
                  'IPv4',
                  generalMapper(infrastructure.ipv4, 'IP address'),
                );
              },
            },
          ]
        : []),
      ...(hasInterfaces
        ? [
            {
              title: 'Interfaces/NICs',
              value: infrastructure.nics?.length,
              singular: 'NIC',
              target: 'interfaces',
              onClick: () => {
                handleClick(
                  'Interfaces/NICs',
                  interfaceMapper(infrastructure.nics),
                  'medium',
                );
              },
            },
          ]
        : []),
      ...(hasIPv6
        ? [
            {
              title: 'IPv6 addresses',
              value: infrastructure.ipv6?.length,
              plural: 'addresses',
              singular: 'address',
              target: 'ipv6',
              onClick: () => {
                handleClick(
                  'IPv6',
                  generalMapper(infrastructure.ipv6, 'IP address'),
                );
              },
            },
          ]
        : []),
      ...(hasFqdn
        ? [
            {
              title: 'FQDN',
              value:
                Array.isArray(infrastructure.fqdn) &&
                infrastructure.fqdn.length > 0
                  ? infrastructure.fqdn[0]
                  : 'Not available',
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

NetworkInterfacesCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  handleClick: PropTypes.func,
  infrastructure: PropTypes.shape({
    ipv4: PropTypes.array,
    ipv6: PropTypes.array,
    fqdn: PropTypes.arrayOf(PropTypes.string),
    nics: PropTypes.array,
  }),
  hasIPv4: PropTypes.bool,
  hasIPv6: PropTypes.bool,
  hasFqdn: PropTypes.bool,
  hasInterfaces: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
};

const mapStateToProps = ({ systemProfileStore: { systemProfile } }) => ({
  detailLoaded: systemProfile && systemProfile.loaded,
  infrastructure: infrastructureSelector(systemProfile),
});

export const NetworkInterfacesCard = connect(mapStateToProps)(
  NetworkInterfacesCardCore,
);

NetworkInterfacesCard.propTypes = NetworkInterfacesCardCore.propTypes;

export default NetworkInterfacesCard;
