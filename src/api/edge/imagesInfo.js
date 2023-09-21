export const EDGE_API = '/api/edge/v1';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

export const useGetImageSet = () => {
  const axios = useAxiosWithPlatformInterceptors();
  const query = { limit: 10, offset: 0, sort_by: '-created_at' };
  const params = getTableParams(query);
  return (p) =>
    axios.get(`${EDGE_API}/image-sets/${p.imageSetParam.id}?${params}`);
};
export const useGetDevice = () => {
  const axios = useAxiosWithPlatformInterceptors();
  return (id) => axios.get(`${EDGE_API}/devices/${id}`);
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
