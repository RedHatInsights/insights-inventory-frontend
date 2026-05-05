import React from 'react';
import PropTypes from 'prop-types';
import LoadingCard from '../LoadingCard';
import {
  SATELLITE_TAG_NAMESPACE,
  getSatelliteTagsFromEntityTags,
} from './satelliteTags';

const SATELLITE_FIELDS = [
  { key: 'activation_key', label: 'Activation key' },
  { key: 'content_view', label: 'Content view' },
  { key: 'host_collection', label: 'Host collection' },
  { key: 'hostgroup', label: 'Hostgroup' },
  { key: 'lifecycle_environment', label: 'Lifecycle environment' },
  { key: 'location', label: 'Location' },
  { key: 'organization', label: 'Organization' },
  { key: 'organization_id', label: 'Organization ID' },
  { key: 'organization_label', label: 'Organization label' },
  { key: 'satellite_instance_id', label: 'Satellite instance ID' },
];

const buildTagFilter = ({ namespace, key, value }) => {
  return `/${'?'}tags=${encodeURIComponent(namespace)}/${encodeURIComponent(
    key,
  )}=${encodeURIComponent(value)}`;
};

export const SatelliteCard = ({ entity, satelliteTags: satelliteTagsProp }) => {
  const satelliteTags =
    satelliteTagsProp ?? getSatelliteTagsFromEntityTags(entity?.tags);

  if (!satelliteTags.length) {
    return null;
  }

  const items = SATELLITE_FIELDS.map(({ key, label }) => {
    const tag = satelliteTags.find((t) => t?.key === key && t?.value);
    const value = tag?.value;
    const tagFilter = value
      ? buildTagFilter({ namespace: SATELLITE_TAG_NAMESPACE, key, value })
      : undefined;

    return {
      title: label,
      value: value ?? 'N/A',
      ...(tagFilter ? { target: tagFilter } : {}),
    };
  });

  return (
    <LoadingCard
      title="Satellite"
      cardId="satellite-card"
      isLoading={false}
      items={items}
    />
  );
};

SatelliteCard.propTypes = {
  entity: PropTypes.shape({
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        namespace: PropTypes.string,
        key: PropTypes.string,
        value: PropTypes.string,
      }),
    ),
  }),
  satelliteTags: PropTypes.arrayOf(
    PropTypes.shape({
      namespace: PropTypes.string,
      key: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
};

export default SatelliteCard;
