import { useEffect, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const useActivationKeyPermissions = () => {
  const chrome = useChrome();
  const [permissions, setPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        const rawPermissions =
          await chrome.getUserPermissions('config-manager');

        const permissionsList = rawPermissions.map(
          (rawPermission) => rawPermission.permission,
        );

        const permissions = {
          canReadActivationKeys:
            permissionsList.includes('config-manager:activation_keys:read') ||
            permissionsList.includes('config-manager:activation_keys:*'),
          canWriteActivationKeys:
            permissionsList.includes('config-manager:activation_keys:write') ||
            permissionsList.includes('config-manager:activation_keys:*'),
        };

        setPermissions(permissions);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []); // Only run once on mount

  return { data: permissions, isLoading, error };
};

export { useActivationKeyPermissions };
