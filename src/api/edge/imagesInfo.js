export const EDGE_API = '/api/edge/v1';
import { instance } from '@redhat-cloud-services/frontend-components-utilities/interceptors/interceptors';

export const getImageSet = ({
  id,
  params = {
    limit: 10,
    offset: 0,
    sort_by: '-created_at',
  },
}) => {
  const query = getTableParams(params);
  return instance.get(`${EDGE_API}/image-sets/${id}?${query}`);
};

export const getImageSetViewVersions = ({
  imageSetID,
  params = {
    limit: 20,
    offset: 0,
    sort_by: '-created_at',
  },
}) => {
  const query = getTableParams(params);
  return instance.get(
    `${EDGE_API}/image-sets/view/${imageSetID}/versions?${query}`
  );
};

export const getImageSetView = ({ id }) => {
  return instance.get(`${EDGE_API}/image-sets/view/${id}`);
};

export const getImagePackageMetadata = (id) => {
  try {
    return instance.get(`${EDGE_API}/images/${id}/metadata`);
  } catch (err) {
    console.log(err);
  }
};

export const fetchEdgeImages = (
  params = {
    limit: 20,
    offset: 0,
    sort_by: '-created_at',
  }
) => {
  const query = getTableParams(params);
  return instance.get(`${EDGE_API}/images?${query}`);
};

export const fetchEdgeImageSets = (
  params = {
    limit: 20,
    offset: 0,
    sort_by: '-created_at',
  }
) => {
  const query = getTableParams(params);
  return instance.get(`${EDGE_API}/image-sets?${query}`);
};

export const getEdgeImageStatus = (id) => {
  return instance.get(`${EDGE_API}/images/${id}/status`);
};

export const getImageDataOnDevice = (id) => {
  return instance.get(`${EDGE_API}/updates/device/${id}/image`);
};

export const getImageById = ({ id }) => {
  return instance.get(`${EDGE_API}/images/${id}/details`);
};

export const getImageSets = ({ query }) => {
  if (query === '') {
    query = { limit: 20, offset: 0, sort_by: '-updated_at' };
  }
  const q = getTableParams(query);
  return instance.get(`${EDGE_API}/image-sets/view?${q}`);
};

export const getTableParams = (q) => {
  if (q === undefined) {
    return '';
  }
  const query = Object.keys(q).reduce((acc, curr) => {
    let value = undefined;
    if (
      typeof q[curr] === 'object' &&
      typeof q[curr].length === 'number' &&
      q[curr].length > 0
    ) {
      value = q[curr].reduce(
        (multiVals, val) =>
          multiVals === '' ? `${curr}=${val}` : `${multiVals}&${curr}=${val}`,
        ''
      );
    }
    if (['string', 'number'].includes(typeof q[curr]) && q[curr] !== '') {
      value = `${curr}=${q[curr]}`;
    }
    return value === undefined
      ? acc
      : acc === ''
      ? `${value}`
      : `${acc}&${value}`;
  }, '');

  return query;
};

export const getDevice = (id) => {
  return instance.get(`${EDGE_API}/devices/${id}`);
};
