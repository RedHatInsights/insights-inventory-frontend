import { useQuery } from '@tanstack/react-query';
import { getViewApi } from '../../../api/inventoryViewsApi';

export const useViewQuery = (viewId: string | undefined) => {
  return useQuery({
    queryKey: ['view', viewId],
    queryFn: () => getViewApi({ viewId: viewId! }),
    enabled: !!viewId,
  });
};
