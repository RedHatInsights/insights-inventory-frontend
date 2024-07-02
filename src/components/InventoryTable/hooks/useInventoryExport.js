import { useCallback } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

const EXPORT_SERVICE_PATH = '/api/export/v1/exports';
const EXPORT_SERVICE_APPLICATON = 'urn:redhat:application:inventory';
const EXPORT_SERVICE_RESOURCE = EXPORT_SERVICE_APPLICATON + ':systems';

const buildExportJson = (filters, format) => ({
  name: 'inventory-export',
  format,
  sources: [
    {
      application: EXPORT_SERVICE_APPLICATON,
      resource: EXPORT_SERVICE_RESOURCE,
      filters,
    },
  ],
});

const useInventoryExport = ({ filters = {}, onError, onSuccess }) => {
  const axios = useAxiosWithPlatformInterceptors();

  const onSelect = useCallback(
    (_, format) => {
      axios
        .post(EXPORT_SERVICE_PATH, buildExportJson(filters, format))
        .then(() => {
          onSuccess?.();
        })
        .catch((error) => {
          onError?.(error);
        });
    },
    [filters, axios]
  );

  return {
    onSelect,
  };
};

export default useInventoryExport;
