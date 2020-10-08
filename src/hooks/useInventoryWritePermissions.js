import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/files/RBACHook';

const useInventoryWritePermissions = () => {
    const { hasAccess } = usePermissions('inventory', [
        'inventory:*:*',
        'inventory:hosts:write',
        'inventory:*:write'
    ]);

    return insights.chrome.isProd || hasAccess;
};

export default useInventoryWritePermissions;
