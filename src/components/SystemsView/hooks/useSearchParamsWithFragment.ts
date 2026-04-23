import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

const FRAGMENT_VALUE_MAPPING: Record<string, string> = {
  'Ansible Automation Platform': 'ansible',
  SAP: 'sap',
  'Microsoft SQL': 'mssql',
};

export const useSearchParamsWithFragment = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const combinedParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);

    hashParams.forEach((value, key) => {
      if (value) {
        const normalizedValue = FRAGMENT_VALUE_MAPPING[value] || value;

        if (key === 'workloads' || key === 'tags') {
          // Check if this specific normalized value is already present to avoid ?workloads=sap&workloads=sap
          const currentValues = params.getAll(key);
          if (!currentValues.includes(normalizedValue)) {
            params.append(key, normalizedValue);
          }
        } else if (!params.has(key)) {
          params.set(key, normalizedValue);
        }
      }
    });

    return params;
  }, [searchParams]);

  return [combinedParams, setSearchParams] as const;
};
