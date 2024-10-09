import { useCallback, useEffect, useRef, useState } from 'react';
import { getOperatingSystems } from '../../api';

const initialState = {
  operatingSystems: [],
  operatingSystemsLoaded: false,
};

const useFetchOperatingSystems = ({
  apiParams = [],
  hasAccess,
  showCentosVersions,
  fetchCustomOSes,
}) => {
  const mounted = useRef(true);

  const [data, setData] = useState(initialState);

  const fetchOperatingSystems = useCallback(async () => {
    if (hasAccess === false) return;

    const fetchFn = fetchCustomOSes || getOperatingSystems;
    const fetchArgs = [apiParams, showCentosVersions];
    console.log(fetchFn, 'fetchFN');

    try {
      return await fetchFn(...fetchArgs);
    } catch (error) {
      return { results: [] };
    }
  }, [
    hasAccess,
    JSON.stringify(apiParams),
    showCentosVersions,
    typeof fetchCustomOSes !== 'undefined',
  ]);

  useEffect(() => {
    (async () => {
      const result = await fetchOperatingSystems();
      if (mounted.current) {
        setData({
          operatingSystems: result?.results || [],
          operatingSystemsLoaded: true,
        });
      }
    })();

    return () => {
      setData(initialState);
      mounted.current = false;
    };
  }, [fetchOperatingSystems]);

  return data;
};

export default useFetchOperatingSystems;
