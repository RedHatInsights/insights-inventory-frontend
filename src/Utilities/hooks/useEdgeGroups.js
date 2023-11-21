import { useEffect, useState } from 'react';
import useFeatureFlag from '../useFeatureFlag';
import { fetchEdgeEnforceGroups } from '../../api';

const useEdgeGroups = () => {
  const [data, setData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const edgeParityInventoryGroupsEnabled = useFeatureFlag(
    'edgeParity.inventory-groups-enabled'
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (edgeParityInventoryGroupsEnabled) {
          const response = await fetchEdgeEnforceGroups();
          const enforceEdgeGroups = response?.enforce_edge_groups;
          setData(enforceEdgeGroups);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  return [data, isLoading];
};

export default useEdgeGroups;
