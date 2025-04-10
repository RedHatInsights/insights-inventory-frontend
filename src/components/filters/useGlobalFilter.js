import { useEffect, useState } from 'react';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const useGlobalFilter = () => {
  const chrome = useChrome();
  const edgeParityFilterDeviceEnabled = useFeatureFlag(
    'edgeParity.inventory-list-filter'
  );
  const [globalFilter, setGlobalFilter] = useState();

  useEffect(() => {
    chrome.hideGlobalFilter(false);
    const unlisten = chrome.on('GLOBAL_FILTER_UPDATE', ({ data }) => {
      const [workloads, SID, tags] = chrome.mapGlobalFilter(data, false, true);

      setGlobalFilter({
        tags,
        filter: {
          ...globalFilter?.filter,
          system_profile: {
            ...globalFilter?.filter?.system_profile,
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
      });
    });

    return () => unlisten();
  }, [edgeParityFilterDeviceEnabled]);

  return globalFilter;
};

export default useGlobalFilter;
