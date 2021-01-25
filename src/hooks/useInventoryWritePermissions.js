import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const useInventoryWritePermissions = () => {
    const { hasAccess, ...rest } = usePermissions('inventory', [
        'inventory:*:*',
        'inventory:hosts:write',
        'inventory:*:write'
    ]);

    return { ...rest, hasAccess };
};

export default useInventoryWritePermissions;
