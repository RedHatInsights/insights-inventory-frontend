/** Namespace used by Satellite-related inventory tags (must stay in sync with Satellite docs). */
export const SATELLITE_TAG_NAMESPACE = 'satellite';

export const getSatelliteTagsFromEntityTags = (tags) =>
  (tags || []).filter((t) => t?.namespace === SATELLITE_TAG_NAMESPACE);
