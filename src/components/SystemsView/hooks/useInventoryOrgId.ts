import { useEffect, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { getOrgIdFromChromeUser } from '../utils/inventoryTableDraftStorage';

export const useInventoryOrgId = () => {
  const chrome = useChrome();
  const [orgId, setOrgId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    chrome.auth
      .getUser()
      .then((user) => {
        if (cancelled) {
          return;
        }
        setOrgId(getOrgIdFromChromeUser(user) ?? 'unknown');
      })
      .catch(() => {
        if (!cancelled) {
          setOrgId('unknown');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chrome]);

  return orgId;
};
