import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { bootcSelector } from '../selectors';
import { extraShape } from '../../../constants';

export const BootcImageCard = ({ handleClick, extra }) => {
  const { detailLoaded, bootc } = useSelector(
    ({ systemProfileStore: { systemProfile } }) => ({
      detailLoaded: systemProfile && systemProfile.loaded,
      bootc: bootcSelector(systemProfile),
    })
  );

  return (
    <LoadingCard
      title="BOOTC"
      isLoading={!detailLoaded}
      items={[
        ...[{ title: 'Booted Image', value: bootc.bootedImage }],
        ...[{ title: 'Booted Image Digest', value: bootc.bootedImageDigest }],
        ...[{ title: 'Staged Image', value: bootc.stagedImage }],
        ...[{ title: 'Staged Image Digest', value: bootc.stagedImageDigest }],
        ...[{ title: 'Available Image', value: bootc.availableImage }],
        ...[
          {
            title: 'Available Image Digest',
            value: bootc.availableImageDigest,
          },
        ],
        ...[{ title: 'Rollback Image', value: bootc.rollbackImage }],
        ...[
          { title: 'Rollback Image Digest', value: bootc.rollbackImageDigest },
        ],
        ...extra.map(({ onClick, ...item }) => ({
          ...item,
          ...(onClick && { onClick: (e) => onClick(e, handleClick) }),
        })),
      ]}
    />
  );
};

BootcImageCard.propTypes = {
  detailLoaded: PropTypes.bool,
  handleClick: PropTypes.func,
  bootc: PropTypes.shape({
    bootedImage: PropTypes.string,
    bootedImageDigest: PropTypes.string,
    stagedImage: PropTypes.string,
    stagedImageDigest: PropTypes.string,
    availableImage: PropTypes.string,
    availableImageDigest: PropTypes.string,
    rollbackImage: PropTypes.string,
    rollbackImageDigest: PropTypes.string,
  }),
  extra: PropTypes.arrayOf(extraShape),
};
BootcImageCard.defaultProps = {
  detailLoaded: false,
  handleClick: () => undefined,
  extra: [],
};
