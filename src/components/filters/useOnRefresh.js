import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';
import {
  calculateFilters,
  calculatePagination,
  calculateSorting,
} from '../InventoryTabs/ConventionalSystems/Utilities';
import { useLocation } from 'react-router-dom';

const useOnRefresh = (extraCallback) => {
  const navigate = useInsightsNavigate();
  const location = useLocation();

  return (options, defaultCallback) => {
    const searchParams = new URLSearchParams();
    calculateFilters(searchParams, options?.filters);
    calculatePagination(searchParams, options?.page, options?.per_page);
    calculateSorting(searchParams, options?.sortBy);
    const search = searchParams.toString();
    navigate({
      search,
      hash: location.hash,
    });

    if (defaultCallback) {
      defaultCallback(options);
    }

    if (extraCallback) {
      extraCallback(options);
    }
  };
};

export default useOnRefresh;
