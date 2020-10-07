import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/files/RBACHook';

const useInventoryWritePermissions = () => {
    const { hasAccess, ...rest } = usePermissions('inventory', [
        'inventory:*:*',
        'inventory:hosts:write',
        'inventory:*:write'
    ]);

    return { ...rest, hasAccess: insights.chrome.isProd || hasAccess };
};

export default useInventoryWritePermissions;
