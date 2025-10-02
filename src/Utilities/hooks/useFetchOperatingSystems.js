import { useEffect, useRef, useState } from 'react';
import { getOperatingSystems } from '../../api';
import { useDeepCompareCallback } from 'use-deep-compare';

const initialState = {
  operatingSystems: [],
  operatingSystemsLoaded: false,
};

const useFetchOperatingSystems = ({
  apiParams = {},
  hasAccess,
  showCentosVersions,
  fetchCustomOSes,
}) => {
  const mounted = useRef(true);

  const [data, setData] = useState(initialState);

  const fetchOperatingSystems = useDeepCompareCallback(async () => {
    if (hasAccess === false) return;

    const fetchFn = fetchCustomOSes || getOperatingSystems;
    const fetchArgs = [apiParams, showCentosVersions];

    try {
      return await fetchFn(...fetchArgs);
    } catch (error) {
      console.error(error);
      return { results: [] };
    }
  }, [hasAccess, apiParams, showCentosVersions, fetchCustomOSes]);

  useEffect(() => {
    mounted.current = true;
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
