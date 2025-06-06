import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { biosSelector } from '../selectors';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { extraShape, isDate } from '../../../constants';

const BiosCardCore = ({
  bios,
  detailLoaded,
  hasVendor,
  hasVersion,
  handleClick,
  hasReleaseDate,
  extra,
}) => (
  <LoadingCard
    title="BIOS"
    cardId="bios-card"
    isLoading={!detailLoaded}
    items={[
      ...(hasVendor ? [{ title: 'Vendor', value: bios.vendor }] : []),
      ...(hasVersion ? [{ title: 'Version', value: bios.version }] : []),
      ...(hasReleaseDate
        ? [
            {
              title: 'Release date',
              value: isDate(bios.releaseDate) ? (
                <DateFormat date={new Date(bios.releaseDate)} type="onlyDate" />
              ) : (
                'Not available'
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

BiosCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  handleClick: PropTypes.func,
  bios: PropTypes.shape({
    vendor: PropTypes.string,
    version: PropTypes.string,
    releaseDate: PropTypes.string,
    csm: PropTypes.arrayOf(PropTypes.string),
  }),
  hasVendor: PropTypes.bool,
  hasVersion: PropTypes.bool,
  hasReleaseDate: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
};
BiosCardCore.defaultProps = {
  detailLoaded: false,
  handleClick: () => undefined,
  extra: [],
  hasVendor: true,
  hasVersion: true,
  hasReleaseDate: true,
};

export const BiosCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    detailLoaded: systemProfile && systemProfile.loaded,
    bios: biosSelector(systemProfile),
  }),
)(BiosCardCore);

BiosCard.propTypes = BiosCardCore.propTypes;
BiosCard.defaultProps = BiosCardCore.defaultProps;

export default BiosCard;
