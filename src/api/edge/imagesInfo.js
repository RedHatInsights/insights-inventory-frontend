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
  const params = getTableParams(query);
  return instance.get(`${EDGE_API}/image-sets/view?${params}`);
};

export const getTableParams = (param) => {
  if (param === undefined) {
    return '';
  }
  const query = Object.keys(param).reduce((acc, curr) => {
    let value = undefined;
    if (
      typeof param[curr] === 'object' &&
      typeof param[curr].length === 'number' &&
      param[curr].length > 0
    ) {
      value = param[curr].reduce(
        (multiVals, val) =>
          multiVals === '' ? `${curr}=${val}` : `${multiVals}&${curr}=${val}`,
        ''
      );
    }
    if (
      ['string', 'number'].includes(typeof param[curr]) &&
      param[curr] !== ''
    ) {
      value = `${curr}=${param[curr]}`;
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
