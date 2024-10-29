import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { generalMapper, interfaceMapper } from '../dataMapper';
import { infrastructureSelector } from '../selectors';
import { extraShape } from '../../../constants';

const InfrastructureCardCore = ({
  infrastructure,
  handleClick,
  detailLoaded,
  hasType,
  hasVendor,
  hasPublicIp,
  hasIPv4,
  hasIPv6,
  hasFqdn,
  hasInterfaces,
  extra,
}) => (
  <LoadingCard
    title="Infrastructure"
    isLoading={!detailLoaded}
    cardId="infrastructure-card"
    items={[
      ...(hasType ? [{ title: 'Type', value: infrastructure.type }] : []),
      ...(hasVendor ? [{ title: 'Vendor', value: infrastructure.vendor }] : []),
      ...(hasPublicIp
        ? [
            {
              title: 'Public IP',
              value:
                Array.isArray(infrastructure.public_ipv4_addresses) &&
                infrastructure.public_ipv4_addresses.length > 0
                  ? infrastructure.public_ipv4_addresses[0]
                  : 'Not available',
            },
          ]
        : []),
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
                  generalMapper(infrastructure.ipv4, 'IP address')
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
                  generalMapper(infrastructure.ipv6, 'IP address')
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
                  'medium'
                );
              },
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

InfrastructureCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  handleClick: PropTypes.func,
  infrastructure: PropTypes.shape({
    type: PropTypes.string,
    vendor: PropTypes.string,
    public_ipv4_addresses: PropTypes.arrayOf(PropTypes.string),
    ipv4: PropTypes.array,
    ipv6: PropTypes.array,
    fqdn: PropTypes.arrayOf(PropTypes.string),
    nics: PropTypes.array,
  }),
  hasType: PropTypes.bool,
  hasVendor: PropTypes.bool,
  hasPublicIp: PropTypes.bool,
  hasIPv4: PropTypes.bool,
  hasIPv6: PropTypes.bool,
  hasFqdn: PropTypes.bool,
  hasInterfaces: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
};
InfrastructureCardCore.defaultProps = {
  detailLoaded: false,
  handleClick: () => undefined,
  hasType: true,
  hasVendor: true,
  hasPublicIp: true,
  hasIPv4: true,
  hasIPv6: true,
  hasFqdn: true,
  hasInterfaces: true,
  extra: [],
};

const mapStateToProps = ({
  entityDetails: { entity },
  systemProfileStore: { systemProfile },
}) => ({
  detailLoaded: systemProfile && systemProfile.loaded,
  infrastructure: infrastructureSelector(systemProfile, entity),
});

export const InfrastructureCard = connect(mapStateToProps)(
  InfrastructureCardCore
);

InfrastructureCard.propTypes = InfrastructureCardCore.propTypes;
InfrastructureCard.defaultProps = InfrastructureCardCore.defaultProps;

export default InfrastructureCard;
