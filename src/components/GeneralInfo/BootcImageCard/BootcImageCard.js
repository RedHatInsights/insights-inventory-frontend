import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { bootcSelector } from '../selectors';
import { extraShape } from '../../../constants';

const BootcImageCardCore = ({ bootc, detailLoaded, handleClick, extra }) => (
  <LoadingCard
    title="BOOTC"
    isLoading={!detailLoaded}
    items={[
      ...[{ title: 'Booted Image', value: bootc.bootedImage }],
      ...[{ title: 'Booted Image Digest', value: bootc.bootedImageDigest }],
      ...[{ title: 'Staged Image', value: bootc.stagedImage }],
      ...[{ title: 'Staged Image Digest', value: bootc.stagedImageDigest }],
      ...[{ title: 'Rollback Image', value: bootc.rollbackImage }],
      ...[{ title: 'Rollback Image Digest', value: bootc.rollbackImageDigest }],
      ...extra.map(({ onClick, ...item }) => ({
        ...item,
        ...(onClick && { onClick: (e) => onClick(e, handleClick) }),
      })),
    ]}
  />
);

BootcImageCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  handleClick: PropTypes.func,
  bootc: PropTypes.shape({
    bootedImage: PropTypes.string,
    bootedImageDigest: PropTypes.string,
    stagedImage: PropTypes.string,
    stagedImageDigest: PropTypes.string,
    rollbackImage: PropTypes.string,
    rollbackImageDigest: PropTypes.string,
  }),
  extra: PropTypes.arrayOf(extraShape),
};
BootcImageCardCore.defaultProps = {
  detailLoaded: false,
  handleClick: () => undefined,
  extra: [],
};

export const BootcImageCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    detailLoaded: systemProfile && systemProfile.loaded,
    bootc: bootcSelector(systemProfile),
  })
)(BootcImageCardCore);

BootcImageCard.propTypes = BootcImageCardCore.propTypes;
BootcImageCard.defaultProps = BootcImageCardCore.defaultProps;

export default BootcImageCard;
