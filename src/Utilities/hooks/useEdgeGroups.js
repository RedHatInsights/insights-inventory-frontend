import { useEffect, useState } from 'react';
import useFeatureFlag from '../useFeatureFlag';
import { fetchEdgeEnforceGroups } from '../../api';

const useEdgeGroups = (value) => {
  const [data, setData] = useState(value);
  const edgeParityInventoryGroupsEnabled = useFeatureFlag(
    'edgeParity.inventory-groups-enabled'
  );

  useEffect(() => {
    if (edgeParityInventoryGroupsEnabled) {
      (async () => {
        const response = await fetchEdgeEnforceGroups();
        const enforceEdgeGroups = response?.enforce_edge_groups;
        setData(enforceEdgeGroups);
      })();
    }
  }, []);

  return data;
};

export default useEdgeGroups;
