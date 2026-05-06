import React, { type ComponentProps } from 'react';
import LoadingCard from '../LoadingCard';
import {
  SATELLITE_TAG_NAMESPACE,
  getSatelliteTagsFromEntityTags,
  type InventoryTag,
} from './satelliteTags';

type SatelliteField = { key: string; label: string };

const SATELLITE_FIELDS: SatelliteField[] = [
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

const buildTagFilter = ({
  namespace,
  key,
  value,
}: {
  namespace: string;
  key: string;
  value: string;
}) =>
  `/${'?'}tags=${encodeURIComponent(namespace)}/${encodeURIComponent(
    key,
  )}=${encodeURIComponent(value)}`;

export type SatelliteCardEntity = {
  tags?: InventoryTag[];
};

export type SatelliteCardProps = {
  entity?: SatelliteCardEntity;
  satelliteTags?: InventoryTag[];
};

export const SatelliteCard = ({
  entity,
  satelliteTags: satelliteTagsProp,
}: SatelliteCardProps) => {
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
      items={items as unknown as ComponentProps<typeof LoadingCard>['items']}
    />
  );
};

export default SatelliteCard;
