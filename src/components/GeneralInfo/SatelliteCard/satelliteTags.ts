/** Namespace used by Satellite-related inventory tags (must stay in sync with Satellite docs). */
export const SATELLITE_TAG_NAMESPACE = 'satellite';

export type InventoryTag = {
  namespace?: string;
  key?: string;
  value?: string;
};

export const getSatelliteTagsFromEntityTags = (
  tags: InventoryTag[] | null | undefined,
): InventoryTag[] =>
  (tags ?? []).filter((t) => t?.namespace === SATELLITE_TAG_NAMESPACE);
