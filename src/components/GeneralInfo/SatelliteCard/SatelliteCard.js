import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import LoadingCard from '../LoadingCard';

const SATELLITE_NAMESPACE = 'satellite';

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
].sort((a, b) => a.label.localeCompare(b.label));

const buildTagFilter = ({ namespace, key, value }) => {
  return `/${'?'}tags=${encodeURIComponent(namespace)}/${encodeURIComponent(
    key,
  )}=${encodeURIComponent(value)}`;
};

export const SatelliteCard = ({ entity }) => {
  const satelliteTags = useMemo(() => {
    return (entity?.tags || []).filter(
      (t) => t?.namespace === SATELLITE_NAMESPACE,
    );
  }, [entity?.tags]);

  if (!satelliteTags.length) {
    return null;
  }

  const valueByKey = satelliteTags.reduce((acc, { key, value }) => {
    if (!acc[key] && value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const items = SATELLITE_FIELDS.map(({ key, label }) => {
    const value = valueByKey[key];
    const tagFilter =
      value === undefined
        ? undefined
        : buildTagFilter({ namespace: SATELLITE_NAMESPACE, key, value });

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
};

export default SatelliteCard;
