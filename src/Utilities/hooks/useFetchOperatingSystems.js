import { useCallback, useEffect, useRef, useState } from 'react';
import { getOperatingSystems } from '../../api';

const useFetchOperatingSystems = ({
  apiParams = [],
  hasAccess,
  showCentosVersions,
}) => {
  const mounted = useRef(true);
  const initialState = {
    operatingSystems: [],
    operatingSystemsLoaded: false,
  };
  const [data, setData] = useState(initialState);

  const fetchOperatingSystems = useCallback(async () => {
    if (typeof hasAccess === 'undefined') {
      return await getOperatingSystems(apiParams, showCentosVersions);
    } else if (typeof hasAccess !== 'undefined' && hasAccess === true) {
      return await getOperatingSystems(apiParams, showCentosVersions);
    }
  }, [hasAccess, apiParams, showCentosVersions]);

  useEffect(() => {
    (async () => {
      const result = await fetchOperatingSystems();
      if (mounted.current) {
        setData({
          operatingSystems: result.results,
          operatingSystemsLoaded: true,
        });
      }
    })();

    return () => {
      setData(initialState);
      mounted.current = false;
    };
  }, []);

  return data;
};

export default useFetchOperatingSystems;
