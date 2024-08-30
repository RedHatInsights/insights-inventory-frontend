import { useCallback } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { EXPORT_SERVICE_PATH } from './constants';

const useExportApi = () => {
  const axios = useAxiosWithPlatformInterceptors();

  const create = useCallback(
    (params, { onSuccess, onError }) =>
      axios
        .post(EXPORT_SERVICE_PATH + '/exports', params)
        .then((...args) => {
          onSuccess?.(...args);
        })
        .catch((error) => {
          onError?.(error);
        }),
    [axios]
  );

  const list = useCallback(
    () => axios.get(EXPORT_SERVICE_PATH + '/exports'),
    [axios]
  );

  return {
    create,
    list,
  };
};

export default useExportApi;
