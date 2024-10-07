import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';
import {
  calculateFilters,
  calculatePagination,
} from '../InventoryTabs/ConventionalSystems/Utilities';
import { useLocation } from 'react-router-dom';

const useOnRefresh = (extraCallback) => {
  const navigate = useInsightsNavigate();
  const location = useLocation();

  return (options, defaultCallback) => {
    const filterSearchParams = calculateFilters(
      new URLSearchParams(),
      options?.filters
    );

    const searchParams = calculatePagination(
      filterSearchParams,
      options?.page,
      options?.per_page
    );

    navigate(
      {
        search: searchParams.toString(),
        hash: location.hash,
      },
      {
        replace: true,
      }
    );

    if (defaultCallback) {
      defaultCallback(options);
    }

    if (extraCallback) {
      extraCallback(options);
    }
  };
};

export default useOnRefresh;
