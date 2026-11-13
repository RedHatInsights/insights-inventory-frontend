import { useCallback } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { EXPORT_SERVICE_PATH } from './constants';

const useExportApi = (axios) => {
  const platformAxios = useAxiosWithPlatformInterceptors();

  const create = useCallback(
    (params, { onSuccess, onError }) =>
      (axios || platformAxios)
        .post(EXPORT_SERVICE_PATH + '/exports', params)
        .then((...args) => {
          onSuccess?.(...args);
        })
        .catch((error) => {
          onError?.(error);
        }),
    [axios, platformAxios],
  );

  const status = useCallback(
    (id) =>
      (axios || platformAxios).get(
        EXPORT_SERVICE_PATH + '/exports/' + id + '/status',
      ),
    [axios, platformAxios],
  );

  return {
    create,
    status,
  };
};

export default useExportApi;
