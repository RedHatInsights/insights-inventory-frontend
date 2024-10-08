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
    const fetchArgs = [apiParams, showCentosVersions];

    if (typeof hasAccess === 'undefined' || hasAccess === true) {
      if (fetchCustomOSes) {
        return await fetchCustomOSes(...fetchArgs);
      }

      return await getOperatingSystems(...fetchArgs);
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
          operatingSystems: result.results,
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
