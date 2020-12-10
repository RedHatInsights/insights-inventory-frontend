import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/files/esm/RBACHook';

const useInventoryWritePermissions = () => {
    const { hasAccess, ...rest } = usePermissions('inventory', [
        'inventory:*:*',
        'inventory:hosts:write',
        'inventory:*:write'
    ]);

    return { ...rest, hasAccess };
};

export default useInventoryWritePermissions;
