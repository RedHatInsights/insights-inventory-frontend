import { useCallback, useEffect, useState } from 'react';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const useGlobalFilter = () => {
  const chrome = useChrome();
  const edgeParityFilterDeviceEnabled = useFeatureFlag(
    'edgeParity.inventory-list-filter',
  );
  // FIXME currently there seems to be no way to retrieve the current global filter state to initialise a default
  // This bug already exists in InventoryTable
  const [globalFilter, setGlobalFilterState] = useState();

  const setGlobalFilter = useCallback(
    (tags, workloads, SID) =>
      setGlobalFilterState({
        tags,
        filter: {
          system_profile: {
            ...(workloads?.SAP?.isSelected && { sap_system: true }),
            ...(workloads &&
              workloads['Ansible Automation Platform']?.isSelected && {
                ansible: 'not_nil',
              }),
            ...(workloads?.['Microsoft SQL']?.isSelected && {
              mssql: 'not_nil',
            }),
            ...(edgeParityFilterDeviceEnabled && { host_type: 'nil' }),
            ...(SID?.length > 0 && { sap_sids: SID }),
          },
        },
      }),
    [edgeParityFilterDeviceEnabled],
  );

  useEffect(() => {
    chrome.hideGlobalFilter(false);
    const unlisten = chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
      const [workloads, SID, tags] = chrome.mapGlobalFilter(data, false, true);

      setGlobalFilter(tags, workloads, SID);
    });

    return () => unlisten();
  }, [setGlobalFilter, chrome]);

  return globalFilter;
};

export default useGlobalFilter;
