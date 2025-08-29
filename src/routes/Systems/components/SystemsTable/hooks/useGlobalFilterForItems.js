import { useCallback, useEffect } from 'react';
import { useStateCallbacks } from 'bastilian-tabletools';

import useGlobalFilter from '../../../../../components/filters/useGlobalFilter';

const useGlobalFilterForItems = (itemsProp) => {
  const { current: { reload } = {} } = useStateCallbacks();
  const globalFilter = useGlobalFilter();

  const fetch = useCallback(
    (...args) => itemsProp(...args, globalFilter),
    [globalFilter, itemsProp],
  );

  useEffect(() => {
    if (globalFilter) {
      reload?.();
    }
  }, [reload, globalFilter]);

  return typeof itemsProp === 'function' ? fetch : itemsProp;
};

export default useGlobalFilterForItems;
