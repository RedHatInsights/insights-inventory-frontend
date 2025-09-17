export const EDGE_API = '/api/edge/v1';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

export const useGetInventoryGroupUpdateInfo = () => {
  const axios = useAxiosWithPlatformInterceptors();
  return (id) =>
    axios.get(`${EDGE_API}/updates/inventory-groups/${id}/update-info`);
};
