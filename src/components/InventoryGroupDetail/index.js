import React from 'react';
import { useParams } from 'react-router-dom';
import InventoryGroupDetail from './InventoryGroupDetail';

const InventoryGroupDetailWrapper = () => {
    const { groupId } = useParams();

    return <InventoryGroupDetail groupId={groupId} />;
};

export default InventoryGroupDetailWrapper;
